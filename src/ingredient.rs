// Copyright 2023 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

use std::{collections::HashMap, fs::File};

use c2pa::{Ingredient, Manifest, ManifestStore};

use crate::{
    asset::Asset,
    error::{Error, Result},
};

pub(crate) struct StorableIngredient {
    pub serialized_ingredient: String,
    pub resources: HashMap<String, Vec<u8>>,
}

async fn fetch_remote_manifest(url: &str) -> Result<Vec<u8>> {
    let response = reqwest::get(url)
        .await
        .map_err(Error::RemoteManifestFetch)?;
    let bytes = response.bytes().await.map_err(Error::RemoteManifestFetch)?;

    Ok(bytes.to_vec())
}

pub fn load_ingredient(source: &Asset) -> Result<Ingredient> {
    match source {
        Asset::Buffer(buffer, format) => Ingredient::from_memory(format, buffer),
        Asset::File(path, format) => {
            let mut file = File::open(path)?;
            let format = format
                .as_ref()
                .map(|f| f.to_owned())
                .unwrap_or_else(|| Ingredient::from_file_info(path).format().to_owned());
            Ingredient::from_stream(&format, &mut file)
        }
    }
    .map_err(Error::from)
}

pub async fn create_ingredient(source: &Asset) -> Result<Ingredient> {
    let ingredient = load_ingredient(source)?;

    let remote_manifest_url = ingredient.validation_status().and_then(|status| {
        status.iter().find_map(|item| {
            if item.code().eq("manifest.inaccessible") {
                item.url()
            } else {
                None
            }
        })
    });

    if let Some(remote_manifest_url) = remote_manifest_url {
        let manifest_bytes = fetch_remote_manifest(remote_manifest_url).await?;
        match &source {
            Asset::Buffer(buffer, format) => {
                Ingredient::from_manifest_and_asset_bytes_async(manifest_bytes, format, buffer)
                    .await
                    .map_err(Error::from)
            }
            Asset::File(path, format) => {
                let format = format
                    .as_ref()
                    .map(|f| f.to_owned())
                    .unwrap_or_else(|| Ingredient::from_file_info(path).format().to_owned());
                let mut file = File::open(path).map_err(Error::from)?;
                Ingredient::from_manifest_and_asset_stream_async(manifest_bytes, &format, &mut file)
                    .await
                    .map_err(Error::from)
            }
        }
    } else {
        Ok(ingredient)
    }
}

pub async fn add_source_ingredient(manifest: &mut Manifest, source: &Asset) -> Result<()> {
    let mut source_ingredient = load_ingredient(source)?;

    if let Some(manifest_data) = source_ingredient.manifest_data() {
        let parent_manifest = ManifestStore::from_bytes("application/c2pa", &manifest_data, false)?;
        if let Some(title) = parent_manifest.get_active().and_then(|m| m.title()) {
            source_ingredient.set_title(title);
        }
        manifest.set_parent(source_ingredient)?;
    }

    Ok(())
}
