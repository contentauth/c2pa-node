use c2pa::{cose_sign, create_signer, Ingredient, Manifest};
use futures::{future, TryFutureExt};
use neon::prelude::*;
use neon::types::buffer::TypedArray;
use neon::types::JsBuffer;
use std::collections::HashMap;

mod local;
mod remote;

use crate::error::{as_js_error, Error, Result};
use crate::ingredient::{add_source_ingredient, IngredientSource, StorableIngredient};
use crate::runtime::runtime;
use crate::sign::remote::RemoteSigner;

use self::local::LocalSignerConfiguration;
use self::remote::RemoteSignerConfiguration;

/// Parses a ResourceStore sent in from Node.js into a HashMap<String, Vec<u8>>
fn parse_js_resource_store(
    cx: &mut FunctionContext,
    js_resource_store: Handle<JsObject>,
) -> NeonResult<HashMap<String, Vec<u8>>> {
    js_resource_store
        .get_own_property_names(cx)?
        .to_vec(cx)?
        .iter()
        .try_fold(HashMap::<String, Vec<u8>>::new(), |mut store, key| {
            let key = key.downcast_or_throw::<JsString, _>(cx)?;
            let data = js_resource_store
                .get::<JsBuffer, _, _>(cx, key)?
                .as_slice(cx)
                .to_vec();
            store.insert(key.value(cx), data);

            Ok(store)
        })
}

fn parse_js_storable_ingredient(
    cx: &mut FunctionContext,
    js_ingredient: Handle<JsObject>,
) -> NeonResult<StorableIngredient> {
    let serialized_ingredient = js_ingredient
        .get::<JsString, _, _>(cx, "ingredient")?
        .value(cx)
        .as_str()
        .to_owned();
    let js_resources = js_ingredient.get::<JsObject, _, _>(cx, "resources")?;
    let resources = js_resources
        .get_own_property_names(cx)?
        .to_vec(cx)?
        .iter()
        .try_fold(HashMap::<String, Vec<u8>>::new(), |mut acc, key| {
            let key = key.downcast_or_throw::<JsString, _>(cx)?;
            let data = js_resources
                .get::<JsBuffer, _, _>(cx, key)?
                .as_slice(cx)
                .to_vec();
            acc.insert(key.value(cx), data);

            Ok(acc)
        })?;

    Ok(StorableIngredient {
        serialized_ingredient,
        resources,
    })
}

fn parse_js_storable_ingredients(
    cx: &mut FunctionContext,
    js_ingredients: Handle<JsArray>,
) -> NeonResult<Vec<StorableIngredient>> {
    js_ingredients
        .to_vec(cx)?
        .iter()
        .try_fold(Vec::<StorableIngredient>::new(), |mut acc, curr| {
            let ingredient = curr.downcast_or_throw::<JsObject, _>(cx)?;
            let parsed = parse_js_storable_ingredient(cx, ingredient)?;
            acc.push(parsed);

            Ok(acc)
        })
}

// Stores the manifest data in a way that can be passed to and processed on the worker thread as much as possible
struct ManifestRepresentation {
    pub serialized_manifest: String,
    pub resource_store: HashMap<String, Vec<u8>>,
    pub storable_ingredients: Vec<StorableIngredient>,
}

/// Parses a manifest data object sent from Node.js into Rust data structures for processing
fn parse_js_manifest_object(
    cx: &mut FunctionContext,
    obj: &Handle<JsObject>,
) -> NeonResult<ManifestRepresentation> {
    let serialized_manifest = obj
        .get::<JsString, _, _>(cx, "manifest")?
        .value(cx)
        .as_str()
        .to_owned();

    let js_resource_store = obj.get::<JsObject, _, _>(cx, "resourceStore")?;
    let resource_store = parse_js_resource_store(cx, js_resource_store)?;
    let js_ingredients = obj.get::<JsArray, _, _>(cx, "ingredients")?;
    let storable_ingredients: Vec<StorableIngredient> =
        parse_js_storable_ingredients(cx, js_ingredients)?;

    Ok(ManifestRepresentation {
        serialized_manifest,
        resource_store,
        storable_ingredients,
    })
}

pub enum AssetSource<'a> {
    Memory(&'a str, &'a [u8]),
    File(&'a str, &'a str),
}

enum SignerType {
    Local(LocalSignerConfiguration),
    Remote(RemoteSignerConfiguration),
}

struct SignOptions {
    pub signer: SignerType,
    pub format: String,
    pub embed: bool,
    pub remote_manifest_url: Option<String>,
}

fn signer_config_from_opts(
    cx: &mut FunctionContext,
    opts: &Handle<JsObject>,
) -> NeonResult<SignerType> {
    let signer_type = opts.get::<JsString, _, _>(cx, "type")?.value(cx);

    match signer_type.as_str() {
        "local" => {
            let config = LocalSignerConfiguration::from_options(cx, opts)?;
            Ok(SignerType::Local(config))
        }
        "remote" => {
            let config = RemoteSignerConfiguration::from_options(cx, opts)?;
            Ok(SignerType::Remote(config))
        }
        _ => cx.throw_error("Invalid signer type"),
    }
}

fn parse_options(cx: &mut FunctionContext, obj: Handle<JsObject>) -> NeonResult<SignOptions> {
    let signer_opts = obj.get::<JsObject, _, _>(cx, "signer")?;
    let signer = signer_config_from_opts(cx, &signer_opts)?;
    let format = obj
        .get::<JsString, _, _>(cx, "format")
        .map(|val| val.value(cx))
        .or_else(|_| cx.throw_error("No format provided"))?;
    let embed = obj.get::<JsBoolean, _, _>(cx, "embed")?.value(cx);
    let remote_manifest_url = obj
        .get_opt::<JsString, _, _>(cx, "remoteManifestUrl")?
        .map(|val| val.value(cx))
        .or(None);

    Ok(SignOptions {
        signer,
        format,
        embed,
        remote_manifest_url,
    })
}

fn ingredient_from_storable(storable_ingredient: &StorableIngredient) -> Result<Ingredient> {
    let StorableIngredient {
        serialized_ingredient,
        resources,
    } = storable_ingredient;
    let mut ingredient: Ingredient = serde_json::from_str(serialized_ingredient)
        .map_err(|err| Error::StorableIngredientParseError(err.to_string()))?;
    let ingredient_resources = ingredient.resources_mut();

    resources.iter().try_for_each(|(k, v)| -> Result<()> {
        ingredient_resources.add(k, v.to_owned())?;
        Ok(())
    })?;

    Ok(ingredient)
}

fn process_manifest(manifest_repr: ManifestRepresentation) -> Result<Manifest> {
    let ManifestRepresentation {
        serialized_manifest,
        storable_ingredients,
        resource_store,
    } = manifest_repr;
    let mut manifest: Manifest = serde_json::from_str(&serialized_manifest)
        .map_err(|err| Error::ManifestParseError(err.to_string()))?;
    let resources = manifest.resources_mut();

    resource_store.iter().try_for_each(|(k, v)| -> Result<()> {
        resources.add(k, v.to_owned())?;
        Ok(())
    })?;
q
    storable_ingredients
        .iter()
        .try_for_each(|storable_ingredient| -> Result<()> {
            let ingredient = ingredient_from_storable(storable_ingredient)?;
            manifest.add_ingredient(ingredient);
            Ok(())qqqq
        })?;

    Ok(manifest)
}

struct SignOutput {
    asset: Vec<u8>,
    manifest: Option<Vec<u8>>,
}

async fn sign_manifest(
    manifest: &mut Manifest,
    asset: AssetSource<'_>,
    options: SignOptions,
) -> Result<SignOutput> {
    if let Some(remote_url) = options.remote_manifest_url {
        if options.embed {
            manifest.set_embedded_manifest_with_remote_ref(remote_url);
        } else {
            manifest.set_remote_manifest(remote_url);
        }
    }

    match options.signer {
        SignerType::Local(config) => create_signer::from_keys(
            &config.cert,
            &config.pkey,
            config.alg,
            config.tsa_url.to_owned(),
        )
        .map(|signer| {
            match asset {
                AssetSource::Memory(format, asset) => {
                    manifest.embed_from_memory(format, asset, &*signer)
                }
                AssetSource::File(source_path, dest_path) => {
                    manifest.embed(source_path, dest_path, &*signer)
                }
            }
        })?
        .map(|asset| SignOutput {
            asset,
            manifest: None,
        })
        .map_err(Error::from),

        SignerType::Remote(config) => {
            let signer = RemoteSigner::from_config(config).await?;
            let (asset, manifest) = match asset {
                AssetSource::Memory(format, asset) => {
                    manifest.embed_from_memory_remote_signed(&options.format, asset, &signer).await.map(|(asset, manifest)| (asset, Some(manifest)))
                },
                AssetSource::File(source_path, dest_path) => {
                    manifest.embed_remote_signed(source_path, dest_path, &signer).await.map(|asset| (asset, None))
                }
            }?;

            Ok(SignOutput {
                asset,
                manifest
            })
        }
    }
}

fn create_sign_response(
    cx: &mut TaskContext,
    response_obj: &Handle<'_, JsObject>,
    sign_output: &SignOutput,
) -> NeonResult<()> {
    let signed_asset = JsArrayBuffer::from_slice(cx, sign_output.asset.as_ref())?;
    response_obj.set(cx, "assetBuffer", signed_asset)?;

    if let Some(signed_manifest) = &sign_output.manifest {
        let signed_manifest = JsArrayBuffer::from_slice(cx, signed_manifest.as_ref())?;
        response_obj
            .set(cx, "manifest", signed_manifest)
            .or_else(|err| cx.throw_error(err.to_string()))?;
    }

    Ok(())
}

pub fn sign_buffer(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let manifest_repr = cx
        .argument::<JsObject>(0)
        .and_then(|data| parse_js_manifest_object(&mut cx, &data))?;
    let asset = cx.argument::<JsBuffer>(1)?.as_slice(&cx).to_vec();
    let options = cx
        .argument::<JsObject>(2)
        .and_then(|opts| parse_options(&mut cx, opts))?;

    rt.spawn(async move {
        let format = options.format.to_owned();
        let asset = asset.as_slice();
        let signed = future::ready(process_manifest(manifest_repr))
            .and_then(|mut manifest| async move {
                let source = IngredientSource::Memory(&format, asset);
                add_source_ingredient(&mut manifest, source)
                    .await
                    .map(|_| manifest)
                    .map_err(Error::from)
            })
            .and_then(
                |mut manifest| async move { sign_manifest(&mut manifest, asset, options).await },
            )
            .await;

        deferred.settle_with(&channel, move |mut cx| {
            let response_obj = cx.empty_object();
            match signed {
                Ok(signed) => {
                    create_sign_response(&mut cx, &response_obj, &signed)?;
                }
                Err(err) => {
                    return as_js_error(&mut cx, err).and_then(|err| cx.throw(err));
                }
            };

            Ok(response_obj)
        });
    });

    Ok(promise)
}

pub fn sign_file(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let manifest_repr = cx
        .argument::<JsObject>(0)
        .and_then(|data| parse_js_manifest_object(&mut cx, &data))?;
    let input_path = cx.argument::<JsString>(1)?.value(&mut cx);
    let output_path = cx.argument::<JsString>(2)?.value(&mut cx);
    let options = cx
        .argument::<JsObject>(3)
        .and_then(|opts| parse_options(&mut cx, opts))?;

    rt.spawn(async move {
        let signed = future::ready(process_manifest(manifest_repr))
            .and_then(|mut manifest| async move {
                let source = IngredientSource::File
                add_source_ingredient(&mut manifest, source)
                    .await
                    .map(|_| manifest)
                    .map_err(Error::from)
            })
            .and_then(
                |mut manifest| async move { sign_manifest(&mut manifest, asset, options).await },
            )
            .await;

        deferred.settle_with(&channel, move |mut cx| {
            let response_obj = cx.empty_object();
            match signed {
                Ok(signed) => {
                    create_sign_response(&mut cx, &response_obj, &signed)?;
                }
                Err(err) => {
                    return as_js_error(&mut cx, err).and_then(|err| cx.throw(err));
                }
            };

            Ok(response_obj)
        });
    });

    Ok(promise)
}

pub fn sign_claim_bytes(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let claim = cx.argument::<JsBuffer>(0)?.as_slice(&cx).to_vec();
    let reserve_size = cx.argument::<JsNumber>(1)?.value(&mut cx) as usize;
    let signer_config = cx
        .argument::<JsObject>(2)
        .and_then(|opts| signer_config_from_opts(&mut cx, &opts))?;

    rt.spawn(async move {
        let signer = match signer_config {
            SignerType::Local(config) => create_signer::from_keys(
                &config.cert,
                &config.pkey,
                config.alg,
                config.tsa_url.to_owned(),
            )
            .map_err(Error::from),

            _ => Err(Error::InvalidSigner(
                "Can only sign bytes with local signer".to_string(),
            )),
        };

        let signed = signer.and_then(|signer| {
            cose_sign::sign_claim(&claim, &*signer, reserve_size).map_err(Error::from)
        });

        deferred.settle_with(&channel, move |mut cx| {
            let signed_data = match signed {
                Ok(signed) => JsArrayBuffer::from_slice(&mut cx, &signed)?,
                Err(err) => {
                    return as_js_error(&mut cx, err).and_then(|err| cx.throw(err));
                }
            };

            Ok(signed_data)
        });
    });

    Ok(promise)
}
