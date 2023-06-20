use c2pa::ManifestStore;
use neon::prelude::*;
use neon::result::Throw;
use neon::types::buffer::TypedArray;
use neon::types::{JsBuffer, JsUint8Array};
use std::result::Result as StdResult;

mod error;
mod ingredient;
mod sign;

fn add_to_resource_object(
    cx: &mut FunctionContext,
    obj: &Handle<JsObject>,
    key: &str,
    value: &[u8],
) -> StdResult<(), Throw> {
    let data = JsUint8Array::from_slice(cx, value)?;
    obj.set(cx, key.as_ref(), data)?;
    Ok(())
}

// Allows us to fetch an embedded or remote manifest
fn read(mut cx: FunctionContext) -> JsResult<JsObject> {
    let format = cx.argument::<JsString>(0)?.value(&mut cx);
    let buffer = cx.argument::<JsBuffer>(1)?;
    // TODO: See if we can do this without copying
    let data = buffer.as_slice(&cx).to_vec();

    let store = ManifestStore::from_bytes(&format, &data, true);

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
        .try_for_each(|(label, manifest)| -> StdResult<(), Throw> {
            let manifest_resources = manifest.resources().resources();
            let manifest_resource_obj = cx.empty_object();
            // Process the manifest's ResourceStore
            manifest_resources
                .iter()
                .try_for_each(|(k, v)| -> StdResult<(), Throw> {
                    add_to_resource_object(&mut cx, &manifest_resource_obj, k, v)
                })?;
            // Resources for the manifest are stored in a separate store from the ingredients, so we need to
            // separately process the ingredients' ResourceStores
            manifest
                .ingredients()
                .iter()
                .try_for_each(|ingredient| -> StdResult<(), Throw> {
                    ingredient
                        .resources()
                        .resources()
                        .iter()
                        .try_for_each(|(k, v)| {
                            add_to_resource_object(&mut cx, &manifest_resource_obj, k, v)
                        })
                })?;
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
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("read", read)?;
    cx.export_function("sign", sign::sign)?;
    Ok(())
}
