// Copyright 2023 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

use asset::{parse_asset, Asset};
use c2pa::{Ingredient, ManifestStore};
use neon::prelude::*;
use neon::result::Throw;
use neon::types::JsUint8Array;
use std::result::Result as StdResult;

mod asset;
mod error;
mod ingredient;
mod runtime;
mod sign;

use self::error::{as_js_error, Error};
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

fn read(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let asset = cx
        .argument::<JsObject>(0)
        .and_then(|obj| parse_asset(&mut cx, obj))?;

    rt.spawn(async move {
        let store = match &asset {
            Asset::Buffer(buffer, format) => ManifestStore::from_bytes(format, buffer, true),
            Asset::File(path, _) => ManifestStore::from_file(path),
        }
        .map_err(Error::from);

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

fn create_ingredient(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let rt = runtime(&mut cx)?;
    let channel = cx.channel();
    let (deferred, promise) = cx.promise();

    let asset = cx
        .argument::<JsObject>(0)
        .and_then(|obj| parse_asset(&mut cx, obj))?;

    rt.spawn(async move {
        let ingredient = self::ingredient::create_ingredient(&asset).await;

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
    cx.export_function("create_ingredient", create_ingredient)?;
    cx.export_function("read", read)?;
    cx.export_function("sign", sign::sign)?;
    cx.export_function("sign_claim_bytes", sign::sign_claim_bytes)?;
    Ok(())
}
