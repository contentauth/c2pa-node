// Copyright 2023 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

use neon::prelude::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error(transparent)]
    Json(#[from] serde_json::Error),

    #[error("Manifest parse error: {0}")]
    ManifestParseError(String),

    #[error("Storable ingredient parse error: {0}")]
    StorableIngredientParseError(String),

    #[error(transparent)]
    RemoteManifestFetch(#[from] reqwest::Error),

    #[error("Fetching reserve size failed: {0}")]
    RemoteReserveSize(String),

    #[error("Invalid signer passed: {0}")]
    InvalidSigner(String),

    #[error("The outputPath key must be supplied in the options object when signing a file.")]
    MissingOutputPath,

    #[error(transparent)]
    C2pa(#[from] c2pa::Error),

    #[error(transparent)]
    FileIO(#[from] std::io::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

pub fn as_js_error<'a>(cx: &mut TaskContext<'a>, err: Error) -> JsResult<'a, JsError> {
    cx.execute_scoped(|mut cx| {
        let js_err = cx.error(err.to_string())?;
        let js_err_name = cx.string(format!("{:?}", err));
        js_err.set(&mut cx, "name", js_err_name)?;

        Ok(js_err)
    })
}
