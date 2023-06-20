use c2pa::{create_signer, Manifest, RemoteSigner, SigningAlg};
use core::panic;
use neon::prelude::*;
use neon::types::buffer::TypedArray;
use neon::types::JsBuffer;
use std::collections::HashMap;
use std::str::FromStr;

use crate::error::{Error, Result};
use crate::ingredient::add_source_ingredient;

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

enum SignerType {
    // We need to just store the configuration here since the local signer can't be sent across threads
    Local(LocalSignerConfiguration),
    Remote(Box<dyn RemoteSigner>),
}

struct SignOptions {
    pub signer: SignerType,
    pub format: String,
}

fn signer_from_opts(cx: &mut FunctionContext, opts: &Handle<JsObject>) -> NeonResult<SignerType> {
    let signer_type = opts.get::<JsString, _, _>(cx, "type")?.value(cx);
    if signer_type == "local" {
        let cert = opts
            .get::<JsBuffer, _, _>(cx, "certificate")?
            .as_slice(cx)
            .to_vec();
        let pkey = opts
            .get::<JsBuffer, _, _>(cx, "privateKey")?
            .as_slice(cx)
            .to_vec();
        let alg_str = opts
            .get::<JsString, _, _>(cx, "algorithm")
            .map(|val| val.value(cx))
            .or(Ok(String::from("es256")))?;
        let alg = SigningAlg::from_str(&alg_str).or_else(|err| cx.throw_error(err.to_string()))?;
        let tsa_url = opts
            .get::<JsString, _, _>(cx, "tsaUrl")
            .map(|val| val.value(cx))
            .ok();

        return Ok(SignerType::Local(LocalSignerConfiguration {
            cert,
            pkey,
            alg,
            tsa_url,
        }));
    }

    cx.throw_error("Invalid signer type")
}

fn parse_options(cx: &mut FunctionContext, obj: Handle<JsObject>) -> NeonResult<SignOptions> {
    let signer_opts = obj.get::<JsObject, _, _>(cx, "signer")?;
    let signer = signer_from_opts(cx, &signer_opts)?;
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

fn sign_manifest(manifest: &mut Manifest, asset: &[u8], options: &SignOptions) -> Result<Vec<u8>> {
    match &options.signer {
        SignerType::Local(config) => create_signer::from_keys(
            &config.cert,
            &config.pkey,
            config.alg,
            config.tsa_url.to_owned(),
        )
        .map(|signer| manifest.embed_from_memory(&options.format, asset, &*signer))?
        .map_err(Error::from),
        SignerType::Remote(signer) => panic!("Remote signer not implemented yet"),
    }
}

pub fn sign(mut cx: FunctionContext) -> JsResult<JsArrayBuffer> {
    let serialized_manifest = cx.argument::<JsString>(0)?.value(&mut cx);
    let js_resource_store = cx.argument::<JsObject>(1)?;
    let asset = cx.argument::<JsBuffer>(2)?.as_slice(&cx).to_vec();
    let options = cx
        .argument::<JsObject>(3)
        .and_then(|opts| parse_options(&mut cx, opts))?;
    let resource_store = parse_js_resource_store(&mut cx, js_resource_store)?;

    let signed = process_manifest(&serialized_manifest, &resource_store)
        .and_then(|mut manifest| {
            add_source_ingredient(&mut manifest, &options.format, &asset).map(|_| manifest)
        })
        .and_then(|mut manifest| sign_manifest(&mut manifest, &asset, &options));

    let signed_data = match signed {
        Ok(signed) => JsArrayBuffer::from_slice(&mut cx, &signed),
        Err(err) => {
            // TODO: See if we can factor this out into its own function without mutable borrow issues with `cx`
            let js_err = cx.error(err.to_string())?;
            let js_err_name = cx.string(format!("{:?}", err));
            js_err.set(&mut cx, "name", js_err_name)?;
            return cx.throw(js_err);
        }
    }?;

    Ok(signed_data)
}
