use c2pa::{Ingredient, ManifestStore};
use neon::prelude::*;
use neon::result::Throw;
use neon::types::buffer::TypedArray;
use neon::types::{JsBuffer, JsUint8Array};
use std::result::Result as StdResult;

mod error;
mod ingredient;
mod runtime;
mod sign;

use self::error::{as_js_error, Error};
use self::ingredient::{create_ingredient, IngredientSource};
use self::runtime::runtime;

fn add_to_resource_object(
    cx: &mut ComputeContext,
    obj: &Handle<JsObject>,
    key: &str,
    value: &[u8],
) -> StdResult<(), Throw> {
    let data = JsUint8Array::from_slice(cx, value)?;
    obj.set(cx, key.as_ref(), data)?;
    Ok(())
}

fn process_store(
    mut cx: ComputeContext,
    store: ManifestStore,
) -> StdResult<Handle<'_, JsObject>, Throw> {
    let response_obj = cx.empty_object();
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

// Allows us to fetch an embedded or remote manifest
fn read_buffer(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let format = cx.argument::<JsString>(0)?.value(&mut cx);
    let buffer = cx.argument::<JsBuffer>(1)?;
    // TODO: See if we can do this without copying
    let data = buffer.as_slice(&cx).to_vec();

    rt.spawn(async move {
        let store = ManifestStore::from_bytes(&format, &data, true).map_err(Error::from);

        deferred.settle_with(&channel, move |mut cx| {
            let store = match store {
                Ok(store) => store,
                Err(err) => {
                    return as_js_error(&mut cx, err).and_then(|err| cx.throw(err));
                }
            };

            cx.compute_scoped(move |cx| process_store(cx, store))
        });
    });

    Ok(promise)
}

fn read_file(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let input = cx.argument::<JsString>(0)?.value(&mut cx);

    rt.spawn(async move {
        let store = ManifestStore::from_file(&input).map_err(Error::from);

        deferred.settle_with(&channel, move |mut cx| {
            let store = match store {
                Ok(store) => store,
                Err(err) => {
                    return as_js_error(&mut cx, err).and_then(|err| cx.throw(err));
                }
            };

            cx.compute_scoped(move |cx| process_store(cx, store))
        });
    });

    Ok(promise)
}

fn process_ingredient(
    mut cx: ComputeContext,
    ingredient: Ingredient,
) -> StdResult<Handle<'_, JsObject>, Throw> {
    let response_obj = cx.empty_object();
    let resource_obj = cx.empty_object();

    let serialized_ingredient = serde_json::to_string(&ingredient)
        .map(|s| cx.string(s))
        .or_else(|err| cx.throw_error(err.to_string()))?;

    ingredient
        .resources()
        .resources()
        .iter()
        .try_for_each(|(k, v)| -> StdResult<(), Throw> {
            add_to_resource_object(&mut cx, &resource_obj, k, v)
        })?;

    response_obj
        .set(&mut cx, "ingredient", serialized_ingredient)
        .or_else(|err| cx.throw_error(err.to_string()))?;
    response_obj
        .set(&mut cx, "resources", resource_obj)
        .or_else(|err| cx.throw_error(err.to_string()))?;

    Ok(response_obj)
}

fn create_ingredient_from_buffer(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let format = cx.argument::<JsString>(0)?.value(&mut cx);
    let buffer = cx.argument::<JsBuffer>(1)?.as_slice(&cx).to_vec();

    rt.spawn(async move {
        let source = IngredientSource::Memory(&format, &buffer);
        let ingredient = create_ingredient(source).await;

        deferred.settle_with(&channel, move |mut cx| {
            let ingredient = match ingredient {
                Ok(ingredient) => ingredient,
                Err(err) => {
                    return as_js_error(&mut cx, err).and_then(|err| cx.throw(err));
                }
            };

            cx.compute_scoped(move |cx| process_ingredient(cx, ingredient))
        });
    });

    Ok(promise)
}

fn create_ingredient_from_file(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let path = cx.argument::<JsString>(0)?.value(&mut cx);

    rt.spawn(async move {
        let source = IngredientSource::File(&path);
        let ingredient = create_ingredient(source).await;

        deferred.settle_with(&channel, move |mut cx| {
            let ingredient = match ingredient {
                Ok(ingredient) => ingredient,
                Err(err) => {
                    return as_js_error(&mut cx, err).and_then(|err| cx.throw(err));
                }
            };

            cx.compute_scoped(move |cx| process_ingredient(cx, ingredient))
        });
    });

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function(
        "create_ingredient_from_buffer",
        create_ingredient_from_buffer,
    )?;
    cx.export_function("create_ingredient_from_file", create_ingredient_from_file)?;
    cx.export_function("read_buffer", read_buffer)?;
    cx.export_function("read_file", read_file)?;
    cx.export_function("sign_buffer", sign::sign_buffer)?;
    cx.export_function("sign_file", sign::sign_file)?;
    cx.export_function("sign_claim_bytes", sign::sign_claim_bytes)?;
    Ok(())
}
