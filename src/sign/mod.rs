use c2pa::{cose_sign, create_signer, Manifest};
use futures::{future, TryFutureExt};
use neon::prelude::*;
use neon::types::buffer::TypedArray;
use neon::types::JsBuffer;
use std::collections::HashMap;

mod local;
mod remote;

use crate::error::{as_js_error, Error, Result};
use crate::ingredient::add_source_ingredient;
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

enum SignerType {
    Local(LocalSignerConfiguration),
    Remote(RemoteSignerConfiguration),
}

struct SignOptions {
    pub signer: SignerType,
    pub format: String,
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

    Ok(SignOptions { signer, format })
}

fn process_manifest(
    serialized_manifest: &str,
    resource_store: &HashMap<String, Vec<u8>>,
) -> Result<Manifest> {
    let mut manifest: Manifest = serde_json::from_str(serialized_manifest)
        .map_err(|err| Error::ManifestParseError(err.to_string()))?;
    let resources = manifest.resources_mut();

    resource_store.iter().try_for_each(|(k, v)| -> Result<()> {
        resources.add(k, v.to_owned())?;
        Ok(())
    })?;

    Ok(manifest)
}

async fn sign_manifest(
    manifest: &mut Manifest,
    asset: &[u8],
    options: SignOptions,
) -> Result<Vec<u8>> {
    match options.signer {
        SignerType::Local(config) => create_signer::from_keys(
            &config.cert,
            &config.pkey,
            config.alg,
            config.tsa_url.to_owned(),
        )
        .map(|signer| manifest.embed_from_memory(&options.format, asset, &*signer))?
        .map_err(Error::from),

        SignerType::Remote(config) => {
            let signer = RemoteSigner::from_config(config).await?;
            let (signed_asset, _manifest) = manifest
                .embed_from_memory_remote_signed(&options.format, asset, &signer)
                .await?;

            Ok(signed_asset)
        }
    }
}

pub fn sign(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let serialized_manifest = cx.argument::<JsString>(0)?.value(&mut cx);
    let js_resource_store = cx.argument::<JsObject>(1)?;
    let asset = cx.argument::<JsBuffer>(2)?.as_slice(&cx).to_vec();
    let options = cx
        .argument::<JsObject>(3)
        .and_then(|opts| parse_options(&mut cx, opts))?;
    let resource_store = parse_js_resource_store(&mut cx, js_resource_store)?;

    rt.spawn(async move {
        let format = options.format.to_owned();
        let asset = asset.as_slice();
        let signed = future::ready(process_manifest(&serialized_manifest, &resource_store))
            .and_then(|mut manifest| async move {
                add_source_ingredient(&mut manifest, &format, asset)
                    .await
                    .map(|_| manifest)
                    .map_err(Error::from)
            })
            .and_then(
                |mut manifest| async move { sign_manifest(&mut manifest, asset, options).await },
            )
            .await;

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
