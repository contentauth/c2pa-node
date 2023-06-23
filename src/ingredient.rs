use std::collections::HashMap;

use c2pa::{Ingredient, Manifest, ManifestStore};

use crate::error::{Error, Result};

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

pub async fn create_ingredient_from_memory(format: &str, buffer: &[u8]) -> Result<Ingredient> {
    let ingredient = Ingredient::from_memory(format, buffer)?;

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
        Ingredient::from_manifest_and_asset_bytes_async(manifest_bytes, format, buffer)
            .await
            .map_err(Error::from)
    } else {
        Ok(ingredient)
    }
}

pub async fn add_source_ingredient(
    manifest: &mut Manifest,
    format: &str,
    asset: &[u8],
) -> Result<()> {
    let mut source_ingredient = create_ingredient_from_memory(format, asset).await?;

    if let Some(manifest_data) = source_ingredient.manifest_data() {
        let parent_manifest = ManifestStore::from_bytes("application/c2pa", &manifest_data, false)?;
        if let Some(title) = parent_manifest.get_active().and_then(|m| m.title()) {
            source_ingredient.set_title(title);
        }
        manifest.set_parent(source_ingredient)?;
    }

    Ok(())
}
