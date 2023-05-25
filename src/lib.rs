use c2pa::ManifestStore;
use neon::prelude::*;
use neon::types::buffer::TypedArray;
use neon::types::{JsBuffer, JsUint8Array};

fn add_to_resource_object(
    cx: &mut FunctionContext,
    obj: &Handle<JsObject>,
    key: &str,
    value: &[u8],
) -> NeonResult<()> {
    let data = JsUint8Array::from_slice(cx, value)?;
    obj.set(cx, key.as_ref(), data)?;
    Ok(())
}

// Allows us to fetch an embedded manifest
fn read_asset(mut cx: FunctionContext) -> JsResult<JsObject> {
    let format = cx.argument::<JsString>(0)?.value(&mut cx);
    let buffer = cx.argument::<JsBuffer>(1)?;
    let data = buffer.as_slice(&cx);
    // FIXME - no unwraps
    let store = ManifestStore::from_bytes(&format, data, true).unwrap();
    let serialized_store = cx.string(serde_json::to_string(&store).unwrap());
    let response_obj = cx.empty_object();
    let resource_store = cx.empty_object();

    store
        .manifests()
        .iter()
        // Accumulate resources for every manifest into a map
        .for_each(|(label, manifest)| {
            let manifest_resources = manifest.resources().resources();
            let manifest_resource_obj = cx.empty_object();
            // Process the manifest's ResourceStore
            manifest_resources.iter().for_each(|(k, v)| {
                add_to_resource_object(&mut cx, &manifest_resource_obj, k, v).unwrap();
            });
            // Resources for the manifest are stored in a separate store from the ingredients, so we need to
            // separately process the ingredients' ResourceStores
            manifest.ingredients().iter().for_each(|ingredient| {
                ingredient
                    .resources()
                    .resources()
                    .iter()
                    .for_each(|(k, v)| {
                        add_to_resource_object(&mut cx, &manifest_resource_obj, k, v).unwrap();
                    });
            });
            // FIXME - no unwraps
            resource_store
                .set(&mut cx, label.as_ref(), manifest_resource_obj)
                .unwrap();
        });

    response_obj.set(&mut cx, "serializedStore", serialized_store)?;
    response_obj.set(&mut cx, "resourceStore", resource_store)?;

    Ok(response_obj)
}

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node!"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    cx.export_function("read_asset", read_asset)?;
    Ok(())
}
