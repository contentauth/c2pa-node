// Copyright 2023 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

use c2pa::SigningAlg;
use neon::prelude::*;
use neon::types::buffer::TypedArray;
use neon::types::JsBuffer;
use std::str::FromStr;

#[derive(Debug, Clone)]
pub struct LocalSignerConfiguration {
    pub cert: Vec<u8>,
    pub pkey: Vec<u8>,
    pub alg: SigningAlg,
    pub tsa_url: Option<String>,
}

impl LocalSignerConfiguration {
    pub fn from_options(
        cx: &mut FunctionContext,
        opts: &Handle<JsObject>,
    ) -> NeonResult<LocalSignerConfiguration> {
        let cert = opts
            .get::<JsBuffer, _, _>(cx, "certificate")?
            .as_slice(cx)
            .to_vec();
        let pkey = opts
            .get::<JsBuffer, _, _>(cx, "privateKey")?
            .as_slice(cx)
            .to_vec();
        let alg_str = opts
            .get::<JsString, _, _>(cx, "algorithm")
            .map(|val| val.value(cx))
            .or_else(|_| Ok(String::from("es256")))?;
        let alg = SigningAlg::from_str(&alg_str).or_else(|err| cx.throw_error(err.to_string()))?;
        let tsa_url = opts
            .get::<JsString, _, _>(cx, "tsaUrl")
            .map(|val| val.value(cx))
            .ok();

        Ok(LocalSignerConfiguration {
            cert,
            pkey,
            alg,
            tsa_url,
        })
    }
}
