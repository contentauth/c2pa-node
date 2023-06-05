use c2pa::{create_signer, Manifest, SigningAlg};
use neon::prelude::*;
use neon::types::buffer::TypedArray;
use neon::types::JsBuffer;
use std::collections::HashMap;
use std::str::FromStr;

use crate::error::{Error, Result};
use crate::runtime::runtime;

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

#[derive(Debug)]
struct LocalSignerConfiguration {
    pub cert: Vec<u8>,
    pub pkey: Vec<u8>,
    pub alg: SigningAlg,
    pub tsa_url: Option<String>,
}

struct LocalSignOptions {
    pub config: LocalSignerConfiguration,
    pub format: String,
}

fn parse_local_options(
    cx: &mut FunctionContext,
    obj: Handle<JsObject>,
) -> NeonResult<LocalSignOptions> {
    let signer_opts = obj.get::<JsObject, _, _>(cx, "signer")?;
    let format = obj
        .get::<JsString, _, _>(cx, "format")
        .map(|val| val.value(cx))
        .or_else(|_| cx.throw_error("No format provided"))?;
    let cert = signer_opts
        .get::<JsBuffer, _, _>(cx, "certificate")?
        .as_slice(cx)
        .to_vec();
    let pkey = signer_opts
        .get::<JsBuffer, _, _>(cx, "privateKey")?
        .as_slice(cx)
        .to_vec();
    let alg_str = signer_opts
        .get::<JsString, _, _>(cx, "algorithm")
        .map(|val| val.value(cx))
        .or(Ok(String::from("es256")))?;
    let alg = SigningAlg::from_str(&alg_str).or_else(|err| cx.throw_error(err.to_string()))?;
    let tsa_url = signer_opts
        .get::<JsString, _, _>(cx, "tsaUrl")
        .map(|val| val.value(cx))
        .ok();

    let config = LocalSignerConfiguration {
        cert,
        pkey,
        alg,
        tsa_url,
    };

    Ok(LocalSignOptions { config, format })
}

fn process_manifest(
    serialized_manifest: &str,
    resource_store: &HashMap<String, Vec<u8>>,
) -> Result<Manifest> {
    let mut manifest: Manifest = serde_json::from_str(serialized_manifest)
        .map_err(|err| Error::ManifestParseError(err.to_string()))?;
    let resources = manifest.resources_mut();
    resource_store.iter().for_each(|(k, v)| {
        resources.add(k, v.to_owned());
    });

    Ok(manifest)
}

pub fn sign_asset_local(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let serialized_manifest = cx.argument::<JsString>(0)?.value(&mut cx);
    let js_resource_store = cx.argument::<JsObject>(1)?;
    let asset = cx.argument::<JsBuffer>(2)?.as_slice(&cx).to_vec();
    let options = cx
        .argument::<JsObject>(3)
        .and_then(|opts| parse_local_options(&mut cx, opts))?;
    let resource_store = parse_js_resource_store(&mut cx, js_resource_store)?;

    rt.spawn(async move {
        let sign_config = options.config;
        let format = options.format.to_owned();
        let mut manifest = process_manifest(&serialized_manifest, &resource_store).unwrap();
        let signed = create_signer::from_keys(
            &sign_config.cert,
            &sign_config.pkey,
            sign_config.alg.to_owned(),
            sign_config.tsa_url.to_owned(),
        )
        .map(|signer| manifest.embed_from_memory(&format, &asset, &*signer));

        deferred.settle_with(&channel, move |mut cx| {
            let response_obj = cx.empty_object();
            let signed = match signed {
                Ok(signed) => signed,
                Err(err) => {
                    // TODO: See if we can factor this out into its own function without mutable borrow issues with `cx`
                    let js_err = cx.error(err.to_string())?;
                    let js_err_name = cx.string(format!("{:?}", err));
                    js_err.set(&mut cx, "name", js_err_name)?;
                    return cx.throw(js_err);
                }
            };

            Ok(response_obj)
        });
    });

    Ok(promise)
}
