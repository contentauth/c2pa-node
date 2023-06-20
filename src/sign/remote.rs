use async_trait::async_trait;
use futures::executor;
use neon::prelude::*;

use crate::error::{Error, Result};

pub(crate) struct RemoteSigner {
    channel: Channel,
    sign_fn: Root<JsFunction>,
    reserve_size: usize,
}

#[async_trait]
impl c2pa::RemoteSigner for RemoteSigner {
    async fn sign_remote(&self, data: &[u8]) -> c2pa::Result<Vec<u8>> {
        Ok(data.to_vec())
        // let data = data.to_vec();

        // let client = reqwest::Client::new();
        // let resp = client
        //     .post(&self.endpoint)
        //     .query(&[("box_size", &self.settings.reserve_size)])
        //     .header(reqwest::header::CONTENT_TYPE, "application/octet-stream")
        //     .header(
        //         reqwest::header::HeaderName::from_lowercase(b"x-api-key").unwrap(),
        //         &self.settings.api_key,
        //     )
        //     .header(
        //         reqwest::header::AUTHORIZATION,
        //         format!("Bearer {}", &self.settings.auth_token),
        //     )
        //     .body(data)
        //     .send()
        //     .await
        //     .map_err(|e| c2pa::Error::OtherError(Box::new(e)))?;

        // match resp.status() {
        //     StatusCode::OK => match resp.bytes().await {
        //         Ok(bytes) => Ok(bytes.to_vec()),
        //         Err(_) => Err(c2pa::Error::OtherError(Box::new(
        //             RemoteSignerError::DecodeResponse,
        //         ))),
        //     },
        //     other_status => {
        //         error!("Bad response from claims signer: {:#?}", resp);
        //         Err(c2pa::Error::OtherError(Box::new(
        //             RemoteSignerError::StatusCode(
        //                 other_status,
        //                 resp.text()
        //                     .await
        //                     .unwrap_or_else(|_| "(unable to read HTTP response body)".to_string()),
        //             ),
        //         )))
        //     }
        // }
    }
    fn reserve_size(&self) -> usize {
        self.reserve_size
    }
}

impl RemoteSigner {
    pub fn from_options(
        cx: &mut FunctionContext,
        opts: &Handle<JsObject>,
    ) -> NeonResult<RemoteSigner> {
        let channel = cx.channel();
        let sign_fn = opts.get::<JsFunction, _, _>(cx, "sign")?.root(cx);
        let reserve_size_fn = opts.get::<JsFunction, _, _>(cx, "reserveSize")?;

        let this = cx.undefined();
        let reserve_size = executor::block_on(async {
            let result = reserve_size_fn
                .call(cx, this, [])
                .unwrap()
                .downcast_or_throw::<JsPromise, _>(cx)?
                .to_future(cx, |mut cx, result| {
                    let result = result
                        .or_throw(&mut cx)?
                        .downcast::<JsNumber, _>(&mut cx)
                        .unwrap()
                        .value(&mut cx) as usize;

                    Ok(result)
                })?
                .await
                .unwrap();

            Ok(result)
        })?;

        println!("reserve_size: {}", reserve_size);

        Ok(RemoteSigner {
            channel,
            sign_fn,
            reserve_size,
        })
    }
}
