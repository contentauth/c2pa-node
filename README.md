# C2PA Node.js

The [c2pa-node](https://github.com/contentauth/c2pa-node) repository implements a Node.js API that can:
- Read and validate C2PA data from media files in [supported formats](https://github.com/contentauth/c2pa-rs/blob/main/docs/supported-formats.md).
- Add signed manifests to media files in [supported formats](https://github.com/contentauth/c2pa-rs/blob/main/docs/supported-formats.md).

For more information on using the library in an applicaiton, see [Using the CAI Node library](docs/usage.md).

**WARNING**: This is an early prerelease version of this library.  There may be bugs and unimplemented features, and the API is subject to change.

<div style={{display: 'none'}}>

Additional documentation:
- [Using the Node library](docs/usage.md)
- [Release notes](docs/release-notes.md)
- [Contributing to the project](docs/project-contributions.md)

</div>

## Installation

### Prerequisites

You must install:
- A [supported version of Node](https://github.com/neon-bindings/neon#platform-support).
- [Rust](https://www.rust-lang.org/tools/install).

If you need to manage multiple versions of Node on your machine, use a tool such as [nvm](https://github.com/nvm-sh/nvm).

### Installing for use in a client app

Using npm:

```sh
$ npm install c2pa-node
```

Using Yarn:

```sh
$ yarn add c2pa-node
```

Using pnpm:

```sh
$ pnpm add c2pa-node
```

This command will download precompiled binaries for the following systems:

- Linux x86_64
- Linux aarch64 (ARM)
- macOS aarch64 (Apple Silicon)
- macOS x86_64 (Intel Mac)
- Windows x86
- Windows ARM

All other platforms require building a custom binary as described below, since the `postinstall` step builds the Rust library into a native Node.js module on your machine.

### Building custom binaries

For a platform or architecture that does not have a precompiled binary, you must pre-build a custom binary by following these steps:

1. [Install the Rust toolchain](https://www.rust-lang.org/tools/install).
1. Run the following commands on the target system or VM:
  ```sh
  cd c2pa-node
  pnpm install
  pnpm build:rust
  ```
1. Copy the binary to a place that is accessible by your application (in this example, it is `/path/to/my/application/resources`):
  ```sh
  cd /path/to/my/application
  mkdir resources
  cp /path/to/c2pa-node/generated/c2pa.node resources/c2pa.node
  ```
1. Set the the `C2PA_LIBRARY_PATH` environment variable to the path to the `c2pa.node` module by entering these commands:
  ```sh
  export C2PA_LIBRARY_PATH=resources/c2pa.node
  npm install c2pa-node
  npm start
  ```

**Important:** `C2PA_LIBRARY_PATH` _must_ be set while both **installing** or **adding** `c2pa-node` to your app to avoid building the Rust code. It must _also_ be set while **running** your app so that it loads the bindings from the correct location.
