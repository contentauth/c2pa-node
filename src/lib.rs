use c2pa::{Manifest, ManifestStore};
use neon::prelude::*;
use neon::result::Throw;
use neon::types::buffer::TypedArray;
use neon::types::{JsBuffer, JsUint8Array};
use once_cell::sync::OnceCell;
use std::collections::HashMap;
use tokio::runtime::Runtime;

// Store tokio runtime in a singleton
static RUNTIME: OnceCell<Runtime> = OnceCell::new();

fn runtime<'a, C: Context<'a>>(cx: &mut C) -> NeonResult<&'static Runtime> {
    RUNTIME.get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))
}

fn add_to_resource_object(
    cx: &mut TaskContext,
    obj: &Handle<JsObject>,
    key: &str,
    value: &[u8],
) -> Result<(), Throw> {
    let data = JsUint8Array::from_slice(cx, value)?;
    obj.set(cx, key.as_ref(), data)?;
    Ok(())
}

// Allows us to fetch an embedded or remote manifest
fn read_asset(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let format = cx.argument::<JsString>(0)?.value(&mut cx);
    let buffer = cx.argument::<JsBuffer>(1)?;
    // TODO: See if we can do this without copying
    let data = buffer.as_slice(&cx).to_vec();

    rt.spawn(async move {
        let store = ManifestStore::from_bytes(&format, &data, true);

        deferred.settle_with(&channel, move |mut cx| {
            let response_obj = cx.empty_object();

            let store = match store {
                Ok(store) => store,
                Err(err) => {
                    let js_err = cx.error(err.to_string())?;
                    let js_err_name = cx.string(format!("{:?}", err));
                    js_err.set(&mut cx, "name", js_err_name)?;
                    return cx.throw(js_err);
                }
            };
            let serialized_store = serde_json::to_string(&store)
                .map(|s| cx.string(s))
                .or_else(|err| cx.throw_error(err.to_string()))?;

            let resource_store = cx.empty_object();

            store
                .manifests()
                .iter()
                // Accumulate resources for every manifest into a map
                .try_for_each(|(label, manifest)| -> Result<(), Throw> {
                    let manifest_resources = manifest.resources().resources();
                    let manifest_resource_obj = cx.empty_object();
                    // Process the manifest's ResourceStore
                    manifest_resources
                        .iter()
                        .try_for_each(|(k, v)| -> Result<(), Throw> {
                            add_to_resource_object(&mut cx, &manifest_resource_obj, k, v)
                        })?;
                    // Resources for the manifest are stored in a separate store from the ingredients, so we need to
                    // separately process the ingredients' ResourceStores
                    manifest.ingredients().iter().try_for_each(
                        |ingredient| -> Result<(), Throw> {
                            ingredient
                                .resources()
                                .resources()
                                .iter()
                                .try_for_each(|(k, v)| {
                                    add_to_resource_object(&mut cx, &manifest_resource_obj, k, v)
                                })
                        },
                    )?;
                    resource_store.set(&mut cx, label.as_ref(), manifest_resource_obj)?;
                    Ok(())
                })
                .or_else(|err| cx.throw_error(err.to_string()))?;

            response_obj
                .set(&mut cx, "manifest_store", serialized_store)
                .or_else(|err| cx.throw_error(err.to_string()))?;
            response_obj
                .set(&mut cx, "resource_store", resource_store)
                .or_else(|err| cx.throw_error(err.to_string()))?;

            Ok(response_obj)
        });
    });

    Ok(promise)
}

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

fn process_manifest(serialized_manifest: &str, resource_store: &HashMap<String, Vec<u8>>) -> Result<String, serde_json::Error> {
    let mut manifest: Result<Manifest, serde_json::Error> =
        serde_json::from_str(&serialized_manifest);

}

fn sign_asset(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let serialized_manifest = cx.argument::<JsString>(0)?.value(&mut cx);
    let js_resource_store = cx.argument::<JsObject>(1)?;
    let resource_store = parse_js_resource_store(&mut cx, js_resource_store)?;

    rt.spawn(async move {
        let signed = process_manifest(&serialized_manifest, &resource_store)
        let mut manifest: Result<Manifest, serde_json::Error> =
            serde_json::from_str(&serialized_manifest);

        deferred.settle_with(&channel, move |mut cx| {
            let response_obj = cx.empty_object();

            Ok(response_obj)
        });
    });

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("read_asset", read_asset)?;
    Ok(())
}
