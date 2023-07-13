use neon::prelude::*;
use neon::types::buffer::TypedArray;

pub enum Asset {
    Buffer(Vec<u8>, String),
    File(String, Option<String>),
}

pub fn parse_asset(cx: &mut FunctionContext, obj: Handle<JsObject>) -> NeonResult<Asset> {
    let mime_type = obj
        .get_opt::<JsString, _, _>(cx, "mimeType")?
        .map(|val| val.value(cx))
        .or(None);
    let path = obj
        .get_opt::<JsString, _, _>(cx, "path")?
        .map(|val| val.value(cx))
        .or(None);
    let buffer = obj
        .get_opt::<JsBuffer, _, _>(cx, "buffer")?
        .map(|val| val.as_slice(cx).to_vec())
        .or(None);

    if let (Some(buffer), Some(mime_type)) = (buffer, &mime_type) {
        Ok(Asset::Buffer(buffer, mime_type.to_owned()))
    } else if let Some(path) = path {
        Ok(Asset::File(path, mime_type))
    } else {
        cx.throw_error(
            "Invalid asset data passed. Must contain either a buffer and mimeType or a path.",
        )
    }
}
