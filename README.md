# C2PA Node.js

The [c2pa-node](https://github.com/contentauth/c2pa-node) repository implements a Node.js API that can:
- Read and validate C2PA data from media files in [supported formats](https://opensource.contentauthenticity.org/docs/rust-sdk/#supported-file-formats).
- Add signed manifests to media files in [supported formats](https://opensource.contentauthenticity.org/docs/rust-sdk/#supported-file-formats).

**WARNING**: This is an early prerelease version of this library.  There may be bugs and unimplemented features, and the API is subject to change.

<div style={{display: 'none'}}>

Contents:

- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Installing for use in a client app](#installing-for-use-in-a-client-app)
  - [Building custom binaries](#building-custom-binaries)
  - [Installing for project contributions](#installing-for-project-contributions)
  - [Testing](#testing)
- [Usage](#usage)
  - [Creating a c2pa object](#creating-a-c2pa-object)
  - [Reading a manifest](#reading-a-manifest)
  - [Creating a manifest](#creating-a-manifest)
  - [Adding an ingredient](#adding-an-ingredient)
  - [Signing a manifest](#signing-a-manifest)
- [API documentation](#api-documentation)

</div>

## Installation

### Prerequisites

You must install:
- A [supported version of Node](https://github.com/neon-bindings/neon#platform-support).
- [Rust](https://www.rust-lang.org/tools/install) 

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

This command downloads the latest Rust SDK and builds it as a binding locally (which is why Rust must be locally installed).

**Note**: In the future, CAI may create binary releases so you won't need to install Rust on your machine.

### Building custom binaries

For platforms or architectures that do not have Rust tooling installed, you may need to build custom binaries. To pre-build a binary, [install the Rust toolchain](https://www.rust-lang.org/tools/install) and then run the following commands on the target system or VM:

```sh
$ cd c2pa-node
$ pnpm install
$ pnpm build:rust
```

Then, you can copy the binary to a place that is accessible by your application (in this example, it is `/path/to/my/application/resources`) and set the path to the `c2pa.node` module via the `C2PA_LIBRARY_PATH` environment variable. Enter these commands:

```sh
$ cd /path/to/my/application
$ mkdir resources
$ cp /path/to/c2pa-node/generated/c2pa.node resources/c2pa.node
$ export C2PA_LIBRARY_PATH=resources/c2pa.node
$ npm install c2pa-node
$ npm start
```

**Important:** `C2PA_LIBRARY_PATH` _must_ be set while both **installing** or **adding** c2pa-node to your app to avoid building the Rust code. It must _also_ be set while **running** your app so that it loads the bindings from the correct location.

### Installing for project contributions

If you want to contribute to this project, install the project with npm. In the project directory, enter these commands:

```sh
# Switch to the supported version of Node.js for building
$ nvm use
# Install pnpm
$ npm install -g pnpm
# Install dependencies
$ pnpm install
# Build the SDK
$ pnpm run build
```

### Testing

After installation, run the test suite by entering this command:

```sh
$ pnpm test
```

## Usage

### Creating a c2pa object

Instantiate a `c2pa` object by using [`createC2pa()`](https://github.com/contentauth/c2pa-node/blob/main/docs/README.md#createc2pa):

```ts
import { createC2pa } from 'c2pa-node';

const c2pa = createC2pa();
```

### Reading a manifest

Use the `c2pa.read()` function to read a manifest; for example:

```ts
import { createC2pa } from 'c2pa-node';
import { readFile } from 'node:fs/promises';

const c2pa = createC2pa();

async function read(path, mimeType) {
  const buffer = await readFile(path);
  const result = await c2pa.read({ buffer });

  if (result) {
    const { active_manifest, manifests, validation_status } = result;
    console.log(active_manifest);
  } else {
    console.log('No claim found');
  }
}

read('my-c2pa-file.jpg', 'image/jpeg');
```

### Creating a manifest

To create a manifest, pass the claim information to the [`ManifestBuilder`](https://github.com/contentauth/c2pa-node/blob/main/docs/classes/ManifestBuilder.md) object constructor; for example:

```ts
import { ManifestBuilder } from 'c2pa-node';

const manifest = new ManifestBuilder({
  claim_generator: 'my-app/1.0.0',
  format: 'image/jpeg',
  title: 'node_test_local_signer.jpg',
  assertions: [
    {
      label: 'c2pa.actions',
      data: {
        actions: [
          {
            action: 'c2pa.created',
          },
        ],
      },
    },
    {
      label: 'com.custom.my-assertion',
      data: {
        description: 'My custom test assertion',
        version: '1.0.0',
      },
    },
  ],
});
```

### Adding an ingredient

Use `c2pa.createIngredient()` to load ingredient data for inclusion into a manifest. You can store the ingredient data on the backend and load it at signing time if necessary (for example if the original ingredient is no longer available); for example:

```ts
// Create the ingredient asset from a buffer
const ingredientAssetFromBuffer = {
  buffer: await readFile('my-ingredient.jpg'),
  mimeType: 'image/jpeg',
};
// Or load from a file
const ingredientAssetFromFile = {
  path: resolve('my-ingredient.jpg'),
};

// Create the ingredient
const ingredient = await c2pa.createIngredient({
  asset: ingredientAssetFromBuffer,
  title: 'ingredient.jpg',
});
// Add it to the manifest
manifest.addIngredient(ingredient);
```

### Signing a manifest

Use the `c2pa.sign()` method to sign an ingredient, either locally if you have a signing certificate and key available, or by using a remote signing API.

#### Signing buffers

If you have an asset file's data loaded into memory, you can sign the the asset using a buffer.

**NOTE**: Signing using a buffer is currently supported only for `image/jpeg` and `image/png` data. For all other file types, use the [file-based approach](#signing-files) .

```ts
import { readFile } from 'node:fs/promises';
import { createC2pa, createTestSigner } from 'c2pa-node';

async function sign(asset, manifest) {
  const buffer = await readFile('to-be-signed.jpg');
  const asset: Asset = { buffer, mimeType: 'image/jpeg' };
  const signer = await createTestSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    asset,
    manifest,
  });
}

sign(asset, manifest);
```

#### Signing files

To avoid loading the entire asset into memory (or for file types other than JPEG and PNG that don't support in-memory signing), pass in the file path to the asset file to sign it; for example:

```ts
import { resolve } from 'node:path';
import { createC2pa, createTestSigner } from 'c2pa-node';

async function sign(asset, manifest) {
  const asset = {
    path: resolve('to-be-signed.jpg'),
  };
  const outputPath = resolve('signed.jpg');
  const signer = await createTestSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    manifest,
    asset,
    options: {
      outputPath,
    },
  });
}

sign(asset, manifest);
```

#### Local signing

If you have a signing certificate and key, you can sign locally using a local signer; for example:

```ts
import { readFile } from 'node:fs/promises';
import { SigningAlgorithm } from 'c2pa-node';

async function createLocalSigner() {
  const [certificate, privateKey] = await Promise.all([
    readFile('tests/fixtures/certs/es256.pem'),
    readFile('tests/fixtures/certs/es256.pub'),
  ]);

  return {
    type: 'local',
    certificate,
    privateKey,
    algorithm: SigningAlgorithm.ES256,
    tsaUrl: 'http://timestamp.digicert.com',
  };
}

async function sign(asset, manifest) {
  const buffer = await readFile('to-be-signed.jpg');
  const asset: Asset = { buffer, mimeType: 'image/jpeg' };
  const signer = await createLocalSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    asset,
    manifest,
  });
}

sign(asset, manifest);
```

#### Remote signing

If you have access to a web service that performs signing, you can use it to sign remotely; for example:

```ts
import { readFile } from 'node:fs/promises';
import { fetch, Headers } from 'node-fetch';
import { createC2pa, SigningAlgorithm } from 'c2pa-node';

function createRemoteSigner() {
  return {
    type: 'remote',
    async reserveSize() {
      const url = `https://my.signing.service/box-size`;
      const res = await fetch(url);
      const data = (await res.json()) as { boxSize: number };
      return data.boxSize;
    },
    async sign({ reserveSize, toBeSigned }) {
      const url = `https://my.signing.service/sign?boxSize=${reserveSize}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/octet-stream',
        }),
        body: toBeSigned,
      });
      return res.buffer();
    },
  };
}

async function sign(asset, manifest) {
  const buffer = await readFile('to-be-signed.jpg');
  const asset: Asset = { buffer, mimeType: 'image/jpeg' };
  const signer = createRemoteSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    asset,
    manifest,
  });
}

sign(asset, manifest);
```

## API documentation

For the API documentation, see the [`/docs/` directory](https://github.com/contentauth/c2pa-node/blob/main/docs/README.md).

**WARNING**: The API is subject to change in this early prerelease library.  

