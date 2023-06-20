use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error(transparent)]
    Json(#[from] serde_json::Error),

    #[error("Manifest parse error: {0}")]
    ManifestParseError(String),

    #[error(transparent)]
    RemoteManifestFetch(#[from] ureq::Error),

    #[error(transparent)]
    C2pa(#[from] c2pa::Error),

    #[error("Could not parse Content-Type header")]
    ContentTypeParseError,

    #[error("Could not read remote manifest data")]
    RemoteManifestReadError,
}

pub type Result<T> = std::result::Result<T, Error>;
