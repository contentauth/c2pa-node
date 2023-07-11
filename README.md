# c2pa-node

**c2pa-node:** Node.js bindings for C2PA

## Installing c2pa-node

Installing c2pa-node requires a [supported version of Node and Rust](https://github.com/neon-bindings/neon#platform-support). 
[nvm](https://github.com/nvm-sh/nvm) is a good tool for managing multiple versions of Node on your machine, and you can install
Rust by [visiting this link](https://www.rust-lang.org/tools/install).

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

**Note:** We will be working on creating binary releases so that you will not need Rust installed on your machine in the future.

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
import { readFile } from 'node:fs/promises';

const buffer = await readFile('my-c2pa-file.jpg');
const result = await c2pa.read({ mimeType: 'image/jpeg', buffer });

if (result) {
  const { active_manifest, manifests, validation_status } = result;
  console.log(active_manifest.claim_generator);
}
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
// Create the ingredient
const ingredient = await c2pa.createIngredient({
  asset: ingredientAsset,
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
  const asset: Asset = { mimeType: 'image/jpeg', buffer };
  const signer = createTestSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    sourceType: 'file',
    inputPath,
    outputPath,
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
  const inputPath = resolve('to-be-signed.jpg');
  const outputPath = resolve('signed.jpg');
  const signer = createTestSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    sourceType: 'memory',
    asset,
    manifest,
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
    readFile('tests/fixtures/es256_certs.pem'),
    readFile('tests/fixtures/es256_private.key'),
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
  const asset: Asset = { mimeType: 'image/jpeg', buffer };
  const signer = await createLocalSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    sourceType: 'memory',
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
  const asset: Asset = { mimeType: 'image/jpeg', buffer };
  const signer = createRemoteSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    sourceType: 'memory',
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