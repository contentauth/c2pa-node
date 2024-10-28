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
} from '../dist/js-src/index';

describe('readme examples', () => {
  test('sign an asset', async () => {
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
      expect(active_manifest['claim_generator']).toBe('my-app/1.0.0 c2pa-node/0.0.0 c2pa-rs/0.36.0');
      expect(active_manifest['format']).toBe('image/jpeg');
      expect(active_manifest['title']).toBe('node_test_local_signer.jpg');
    }
  });
});