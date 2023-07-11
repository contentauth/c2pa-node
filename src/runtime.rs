// Copyright 2023 Adobe
// All Rights Reserved.
//
// NOTICE: Adobe permits you to use, modify, and distribute this file in
// accordance with the terms of the Adobe license agreement accompanying
// it.

use neon::prelude::*;
use once_cell::sync::OnceCell;
use tokio::runtime::Runtime;

// Store tokio runtime in a singleton
static RUNTIME: OnceCell<Runtime> = OnceCell::new();

pub fn runtime<'a, C: Context<'a>>(cx: &mut C) -> NeonResult<&'static Runtime> {
    RUNTIME.get_or_try_init(|| Runtime::new().or_else(|err| cx.throw_error(err.to_string())))
}
