c2pa-node / [Exports](modules.md)

# c2pa-node

**c2pa-node:** Node.js bindings for C2PA

## Installing c2pa-node

Installing c2pa-node requires a [supported version of Node and Rust](https://github.com/neon-bindings/neon#platform-support).
[nvm](https://github.com/nvm-sh/nvm) is a good tool for managing multiple versions of Node on your machine, and you can install
Rust by [visiting this link](https://www.rust-lang.org/tools/install).

### Installing for usage in a client app

```sh
# npm
$ npm install c2pa-node
# yarn
$ yarn add c2pa-node
# pnpm
$ pnpm add c2pa-node
```

This will pull down the latest Rust SDK and build it as a binding locally, hence the need for Rust to be locally installed.

**Note:** We will be working on creating binary releases so that you will not need Rust installed on your machine in the future.

#### Building custom binaries

You may need to build custom binaries for platforms or architectures that do not have Rust tooling installed. You can
prebuild a binary on the platform or architecture you would like to run on. To do this, you can run the following
on the system or VM you want to build the binary for (this needs to have the [Rust toolchain installed](https://www.rust-lang.org/tools/install)):

```sh
# in c2pa-node
$ cd c2pa-node
$ pnpm install
$ pnpm build:rust
```

Then, you can copy the binary to a place that is accessible by your application (in this example, it is `/path/to/my/application/resources`) and set the path to the `c2pa.node` module via the `C2PA_LIBRARY_PATH` environment variable:

```sh
# in your application using c2pa-node
$ cd /path/to/my/application
$ mkdir resources
$ cp /path/to/c2pa-node/generated/c2pa.node resources/c2pa.node
$ export C2PA_LIBRARY_PATH=resources/c2pa.node
$ npm install c2pa-node
$ npm start
```

**Important:** `C2PA_LIBRARY_PATH` _must_ be set while both **installing** or **adding** c2pa-node to your app to avoid building the Rust code. It is _also_ required to be set while **running** your app so that it loads the bindings from the correct location.

### Installing for development / contributions

You can install the project with npm. In the project directory, run:

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

## Quick start

### Creating a `c2pa` object

You will need to instantiate a `c2pa` object by using [`createC2pa()`](docs/modules.md#createc2pa):

```ts
import { createC2pa } from 'c2pa-node';

const c2pa = createC2pa();
```

### Reading a manifest

You can read a manifest by using the `c2pa.read()` function:

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

To create a manifest, you can pass in the claim information to a [`ManifestBuilder`](docs/classes//ManifestBuilder.md).

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

You can use `c2pa.createIngredient()` to load ingredient data for inclusion into a manifest. This can be stored on a backend
if necessary and loaded in at signing time without the need for the original ingredient if it is no longer available.

```ts
// Create the ingredient asset from a buffer
const ingredientAssetFromBuffer = {
  buffer: await readFile('my-ingredient.jpg'),
  mimeType: 'image/jpeg',
};
// or from a file
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

You can use the `c2pa.sign()` method to sign an ingredient, either locally if you have a signing certificate and key
available, or by using a remote signing API.

#### Signing buffers

If you have file data loaded into memory, you can sign them using a buffer.

**Note:** This is currently only supported for `image/jpeg` and `image/png` data. All other file types should use
the file-based approach below.

```ts
import { readFile } from 'node:fs/promises';
import { createC2pa, createTestSigner } from 'c2pa-node';

async function sign(asset, manifest) {
  const buffer = await readFile('to-be-signed.jpg');
  const asset: Asset = { buffer, mimeType: 'image/jpeg' };
  const signer = createTestSigner();
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

You can pass in a file path to be signed to avoid loading entire assets into memory, or if a certain file type doesn't
have in-memory support.

```ts
import { resolve } from 'node:path';
import { createC2pa, createTestSigner } from 'c2pa-node';

async function sign(asset, manifest) {
  const asset = {
    path: resolve('to-be-signed.jpg'),
  };
  const outputPath = resolve('signed.jpg');
  const signer = createTestSigner();
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

If you have a signing certificate and key, you can sign locally using a local signer:

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

If you have a service that you want to use for signing, you can use that to sign remotely:

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

[Click here](docs/modules.md) to view the API documentation.

## Testing

After installation, you can run the test suite by running:

```sh
$ pnpm test
```
