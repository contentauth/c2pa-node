use c2pa::{Ingredient, Manifest, ManifestStore};
use futures::executor;

use crate::error::{Error, Result};

fn fetch_remote_manifest(url: &str) -> Result<Vec<u8>> {
    reqwest::blocking::get(url)
        .and_then(|response| response.bytes())
        .map(|bytes| bytes.to_vec())
        .map_err(Error::from)
}

pub fn create_ingredient(format: &str, buffer: &[u8]) -> Result<Ingredient> {
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
        let manifest_bytes = fetch_remote_manifest(remote_manifest_url)?;
        executor::block_on(async {
            Ingredient::from_manifest_and_asset_bytes_async(manifest_bytes, format, buffer)
                .await
                .map_err(Error::from)
        })
    } else {
        Ok(ingredient)
    }
}

pub fn add_source_ingredient(manifest: &mut Manifest, format: &str, asset: &[u8]) -> Result<()> {
    let mut source_ingredient = create_ingredient(format, asset)?;

    if let Some(manifest_data) = source_ingredient.manifest_data() {
        let parent_manifest = ManifestStore::from_bytes("application/c2pa", &manifest_data, false)?;
        if let Some(title) = parent_manifest.get_active().and_then(|m| m.title()) {
            source_ingredient.set_title(title);
        }
        manifest.set_parent(source_ingredient)?;
    }
    Ok(())
}
