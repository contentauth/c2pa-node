// Copyright 2023 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

use async_trait::async_trait;
use c2pa::Error::OtherError;
use neon::prelude::*;
use neon::types::buffer::TypedArray;
use neon::types::JsBuffer;
use std::sync::Arc;
use tokio::sync::oneshot;

use crate::error::{Error, Result};

pub(crate) struct RemoteSignerConfiguration {
    channel: Channel,
    sign_fn: Arc<Root<JsFunction>>,
    reserve_size_fn: Root<JsFunction>,
}

#[async_trait]
impl c2pa::RemoteSigner for RemoteSigner {
    async fn sign_remote(&self, data: &[u8]) -> c2pa::Result<Vec<u8>> {
        let (tx, rx) = oneshot::channel();
        let sign_fn = self.sign_fn.clone();
        let reserve_size = self.reserve_size.to_owned();
        let data = data.to_vec();

        self.channel
            .try_send(move |mut cx| {
                let args = cx.empty_object();
                let reserve_size = cx.number(reserve_size);
                let to_be_signed = JsBuffer::from_slice(&mut cx, &data)?;
                args.set(&mut cx, "reserveSize", reserve_size)?;
                args.set(&mut cx, "toBeSigned", to_be_signed)?;
                let sign_fn = sign_fn.to_inner(&mut cx);

                let sign_fut = sign_fn
                    .call_with(&cx)
                    .arg(args)
                    .apply::<JsPromise, _>(&mut cx)?
                    .to_future(&mut cx, |mut cx, result| {
                        let result = result
                            .or_throw(&mut cx)?
                            .downcast_or_throw::<JsBuffer, _>(&mut cx)?
                            .as_slice(&cx)
                            .to_vec();

                        Ok(result)
                    })?;

                let _ = tx.send(sign_fut);

                Ok(())
            })
            .map_err(|err| OtherError(Box::new(err)))?;

        let sign_fut = rx.await.map_err(|err| OtherError(Box::new(err)))?;
        let sign_result = sign_fut.await.map_err(|err| OtherError(Box::new(err)))?;

        Ok(sign_result)
    }

    fn reserve_size(&self) -> usize {
        self.reserve_size as usize
    }
}

pub(crate) struct RemoteSigner {
    channel: Channel,
    sign_fn: Arc<Root<JsFunction>>,
    reserve_size: f64,
}

impl RemoteSigner {
    pub async fn from_config(config: RemoteSignerConfiguration) -> Result<RemoteSigner> {
        let (tx, rx) = oneshot::channel();

        config
            .channel
            .try_send(move |mut cx| {
                let reserve_size_fn = config.reserve_size_fn.to_inner(&mut cx);

                let reserve_size_fut = reserve_size_fn
                    .call_with(&cx)
                    .apply::<JsPromise, _>(&mut cx)?
                    .to_future(&mut cx, |mut cx, result| {
                        let result = result
                            .or_throw(&mut cx)?
                            .downcast_or_throw::<JsNumber, _>(&mut cx)?
                            .value(&mut cx);

                        Ok(result)
                    })?;

                let _ = tx.send(reserve_size_fut);

                Ok(())
            })
            .map_err(|err| Error::RemoteReserveSize(err.to_string()))?;

        let reserve_size_fut = rx
            .await
            .map_err(|err| Error::RemoteReserveSize(err.to_string()))?;
        let reserve_size = reserve_size_fut
            .await
            .map_err(|err| Error::RemoteReserveSize(err.to_string()))?;

        Ok(RemoteSigner {
            channel: config.channel,
            sign_fn: config.sign_fn,
            reserve_size,
        })
    }
}

impl RemoteSignerConfiguration {
    pub fn from_options(
        cx: &mut FunctionContext,
        opts: &Handle<JsObject>,
    ) -> NeonResult<RemoteSignerConfiguration> {
        let channel = cx.channel();
        let sign_fn = Arc::new(opts.get::<JsFunction, _, _>(cx, "sign")?.root(cx));
        let reserve_size_fn = opts.get::<JsFunction, _, _>(cx, "reserveSize")?.root(cx);

        Ok(RemoteSignerConfiguration {
            channel,
            sign_fn,
            reserve_size_fn,
        })
    }
}
