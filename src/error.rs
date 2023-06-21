use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error(transparent)]
    Json(#[from] serde_json::Error),

    #[error("Manifest parse error: {0}")]
    ManifestParseError(String),

    #[error(transparent)]
    RemoteManifestFetch(#[from] reqwest::Error),

    #[error("Fetching reserve size failed: {0}")]
    RemoteReserveSize(String),

    #[error("Invalid signer passed: {0}")]
    InvalidSigner(String),

    #[error(transparent)]
    C2pa(#[from] c2pa::Error),
}

pub type Result<T> = std::result::Result<T, Error>;
