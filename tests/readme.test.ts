/**
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { readFile } from 'node:fs/promises';
import {
  Asset,
  SigningAlgorithm,
  ManifestBuilder,
  createC2pa,
  LocalSigner,
  createTestSigner,
} from '../dist/js-src/index';

describe('readme examples', () => {
  test('instantiate', async () => {
    const c2pa = createC2pa();
    expect(c2pa).not.toBeNull();
  });

  test('read a manifest', async () => {
    const c2pa = createC2pa();

    async function read(path: string, mimeType: string) {
      const buffer = await readFile(path);
      const result = await c2pa.read({ buffer, mimeType });

      if (result) {
        const { active_manifest, manifests, validation_status } = result;
        // console.log(active_manifest);
        return active_manifest;
      } else {
        // console.log('No claim found');
        return null;
      }
    }

    const activeManifest = await read('tests/fixtures/CAICAI.jpg', 'image/jpeg');
    expect(activeManifest).not.toBeNull();
  });

  test('build a manifest', async () => {
    const manifest = new ManifestBuilder({
      claim_generator: 'my-app/1.0.0',
      format: 'image/jpeg',
      title: 'node_test_manifest_builder.jpg',
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

    expect(manifest).not.toBeNull();
  });

  test('signing an asset file using buffers for JPEG file', async () => {
    const buffer = await readFile('tests/fixtures/A.jpg');
    const asset: Asset = { buffer, mimeType: 'image/jpeg' };

    async function sign(asset: Asset, manifest: ManifestBuilder) {
      const signer = await createTestSigner();
      const c2pa = createC2pa({
        signer,
      });

      return c2pa.sign({
        asset,
        manifest,
      });
    }

    // build a test manifest to add to the asset
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

    const { signedAsset, signedManifest } = await sign(asset, manifest);
    expect(signedManifest).not.toBeNull();
    expect(signedAsset).not.toBeNull();

    const c2pa = createC2pa();
    const result = await c2pa.read(signedAsset);
    const { active_manifest, manifests } = result!;

    expect(result).not.toBeNull();
    expect(manifests).not.toBeNull();
    expect(active_manifest).not.toBeNull();
    if (active_manifest) { // to make TS compiler happy
      expect(active_manifest['format']).toBe('image/jpeg');
      expect(active_manifest['title']).toBe('buffer_signer.jpg');
    }
  });

  test('local signing of an asset file', async () => {
    // define the local signer
    async function createLocalSigner() : Promise<LocalSigner> {
      // reading the files here makes this signer async
      const [certificate, privateKey] = await Promise.all([
        readFile('tests/fixtures/certs/es256.pub'),
        readFile('tests/fixtures/certs/es256.pem'),
      ]);

      // signer config
      return {
        type: 'local',
        certificate,
        privateKey,
        algorithm: SigningAlgorithm.ES256,
        tsaUrl: 'http://timestamp.digicert.com',
      };
    }

    // read the asset
    const buffer = await readFile('tests/fixtures/A.jpg');
    // asset mimetype must match the asset type ebing read
    const asset: Asset = { buffer, mimeType: 'image/jpeg' };

    // build a test manifest to add to the asset
    const manifest = new ManifestBuilder(
      {
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
      },
      { vendor: 'cai' },
    );

    // create the local async signer to use for signing
    const signer = await createLocalSigner();
    // define c2pa here, so we'll reuse it for the reading of the signed asset
    const c2pa = createC2pa({
      signer,
    });

    async function sign(asset: Asset, manifest: ManifestBuilder) {
      // use the defined local signer
      return await c2pa.sign({
        asset,
        manifest,
      });
    }

    // sign the asset
    const { signedAsset } = await sign(asset, manifest);

    // read the signet asset
    const result = await c2pa.read(signedAsset);
    const { active_manifest, manifests } = result!;

    expect(result).not.toBeNull();
    expect(manifests).not.toBeNull();
    expect(active_manifest).not.toBeNull();
    if (active_manifest) { // to make TS compiler happy
      expect(active_manifest['format']).toBe('image/jpeg');
      expect(active_manifest['title']).toBe('node_test_local_signer.jpg');
    }
  });
});