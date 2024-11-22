# Using the CAI Node library

## API documentation

For the API documentation, see the [`/docs/` directory](https://github.com/contentauth/c2pa-node/blob/main/api-docs/README.md).

**WARNING**: The API is subject to change in this early prerelease library.

## Creating a c2pa object

Instantiate a `c2pa` object by using [`createC2pa()`](https://github.com/contentauth/c2pa-node/blob/main/docs/README.md#createc2pa):

```ts
import { createC2pa } from 'c2pa-node';
const c2pa = createC2pa();
```

## Reading a manifest

Use the `c2pa.read()` function to read a manifest; for example:

```ts
import { createC2pa } from 'c2pa-node';
import { readFile } from 'node:fs/promises';

const c2pa = createC2pa();

async function read(path, mimeType) {
  const buffer = await readFile(path);
  const result = await c2pa.read({ buffer, mimeType });

  if (result) {
    const { active_manifest, manifests, validation_status } = result;
    console.log(active_manifest);
  } else {
    console.log('No claim found');
  }
}

await read('my-c2pa-file.jpg', 'image/jpeg');
```

## Creating a manifest

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

## Adding an ingredient

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

## Signing a manifest

Use the `c2pa.sign()` method to sign an ingredient, either locally if you have a signing certificate and key available, or by using a remote signing API.

### Signing buffers

If you have an asset file's data loaded into memory, you can sign the the asset using a buffer.

**NOTE**: Signing using a buffer is currently supported only for `image/jpeg` and `image/png` data. For all other file types, use the [file-based approach](#signing-files) .

```ts
import { readFile } from 'node:fs/promises';
import { createC2pa, createTestSigner } from 'c2pa-node';

// read an asset into a buffer
const buffer = await readFile('to-be-signed.jpg');
const asset: Asset = { buffer, mimeType: 'image/jpeg' };

// build a manifest to use for signing
const manifest = new ManifestBuilder(
  {
    claim_generator: 'my-app/1.0.0',
    format: 'image/jpeg',
    title: 'buffer_signer.jpg',
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
    },
  { vendor: 'cai' },
);

// create a signing function
async function sign(asset, manifest) {
  const signer = await createTestSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    asset,
    manifest,
  });
}

// sign
await sign(asset, manifest);
```

### Signing files

To avoid loading the entire asset into memory (or for file types other than JPEG and PNG that don't support in-memory signing), pass in the file path to the asset file to sign it; for example:

```ts
import { resolve } from 'node:path';
import { createC2pa, createTestSigner } from 'c2pa-node';

// get the asset full path
const asset = {
  path: resolve('to-be-signed.jpg'),
};
// define a location where to place the signed asset
const outputPath = resolve('signed.jpg');

// create a signing function
async function sign(asset, manifest) {
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

// build a manifest to use for signing
const manifest = new ManifestBuilder(
  {
    claim_generator: 'my-app/1.0.0',
    format: 'image/jpeg',
    title: 'buffer_signer.jpg',
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
    },
  { vendor: 'cai' },
);

// sign
await sign(asset, manifest);
```

### Local signing

If you have a signing certificate and key, you can sign locally using a local signer.  This is fine during development, but doing it in production may be insecure. Instead use a Key Management Service (KMS) or a hardware security module (HSM) to access them; for example as show in the [C2PA Python Example](https://github.com/contentauth/c2pa-python-example).

For example:

```ts
import { readFile } from 'node:fs/promises';
import { SigningAlgorithm } from 'c2pa-node';

// create a local signer
async function createLocalSigner() {
  // make sure to update file paths to read from to match locations where you keep them
  const [certificate, privateKey] = await Promise.all([
    readFile('<ES256 certificate_file_location>.pem'),
    readFile('<ES256 certificate_file_location>.pub'),
  ]);

  return {
    type: 'local',
    certificate,
    privateKey,
    algorithm: SigningAlgorithm.ES256,
    tsaUrl: 'http://timestamp.digicert.com',
  };
}

// read the asset
const buffer = await readFile('to-be-signed.jpg');
// asset mimetype must match the asset type being read
const asset: Asset = { buffer, mimeType: 'image/jpeg' };

// create a signing function
async function sign(asset, manifest) {
  const signer = await createLocalSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    asset,
    manifest,
  });
}

// build a manifest to use for signing
const manifest = new ManifestBuilder(
  {
    claim_generator: 'my-app/1.0.0',
    format: 'image/jpeg',
    title: 'buffer_signer.jpg',
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
    },
  { vendor: 'cai' },
);

// sign
await sign(asset, manifest);
```

### Remote signing

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
  const signer = createRemoteSigner();
  const c2pa = createC2pa({
    signer,
  });

  const { signedAsset, signedManifest } = await c2pa.sign({
    asset,
    manifest,
  });
}

const buffer = await readFile('to-be-signed.jpg');
const asset: Asset = { buffer, mimeType: 'image/jpeg' };

const manifest = new ManifestBuilder(
  {
    claim_generator: 'my-app/1.0.0',
    format: 'image/jpeg',
    title: 'buffer_signer.jpg',
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
    },
  { vendor: 'cai' },
);

await sign(asset, manifest);
```