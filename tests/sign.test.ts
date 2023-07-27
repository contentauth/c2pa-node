/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import nock, { type Scope } from 'nock';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { file as temporaryFile } from 'tempy';
import {
  Asset,
  C2pa,
  ManifestBuilder,
  createC2pa,
  createTestSigner,
} from '../dist/js-src/index';
import { ManifestAssertion } from '../js-src/types';
import {
  createRemoteSigner,
  createSuccessRemoteServiceMock,
} from './mocks/remote-signer';

describe('sign()', () => {
  describe('local signing', () => {
    let c2pa: C2pa;

    beforeEach(async () => {
      const signer = await createTestSigner({
        certificatePath: 'tests/fixtures/certs/es256.pub',
        privateKeyPath: 'tests/fixtures/certs/es256.pem',
      });

      c2pa = createC2pa({
        signer,
      });
    });

    test('should sign an unsigned JPEG image with an embedded manifest from a buffer', async () => {
      const fixture = await readFile('tests/fixtures/A.jpg');
      const asset: Asset = { buffer: fixture, mimeType: 'image/jpeg' };
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
      const { signedAsset } = await c2pa.sign({
        asset,
        manifest,
      });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(1);

      // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.label).toMatch(/^cai:/);
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('image/jpeg');
      expect(active_manifest?.signature_info?.issuer).toEqual(
        'C2PA Test Signing Cert',
      );
      expect(active_manifest?.signature_info?.cert_serial_number).toEqual(
        '640229841392226413189608867977836244731148734950',
      );

      const actionsAssertion = active_manifest?.assertions.filter(
        (x: ManifestAssertion) => x.label === 'c2pa.actions',
      );
      expect(actionsAssertion?.length).toEqual(1);
      expect(actionsAssertion?.[0]?.data.actions.length).toEqual(1);
      expect(actionsAssertion?.[0]?.data.actions[0].action).toEqual(
        'c2pa.created',
      );
      expect(actionsAssertion?.[0]?.data.actions[0].parameters).toBeUndefined();

      const customAssertion = active_manifest?.assertions.filter(
        (x: ManifestAssertion) => x.label === 'com.custom.my-assertion',
      );
      expect(customAssertion?.length).toEqual(1);
      expect(customAssertion?.[0]?.data.description).toEqual(
        'My custom test assertion',
      );
      expect(customAssertion?.[0]?.data.version).toEqual('1.0.0');

      const ingredients = active_manifest?.ingredients;
      expect(ingredients?.length).toEqual(0);

      expect(validation_status.length).toEqual(0);
    });

    test('should sign an unsigned JPEG image with an embedded manifest from a file', async () => {
      const asset = { path: resolve('tests/fixtures/A.jpg') };
      const outputPath = temporaryFile({ name: 'A-signed.jpg' });
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
      const { signedAsset } = await c2pa.sign({
        asset: asset,
        manifest,
        options: {
          outputPath,
        },
      });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(1);

      // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.label).toMatch(/^cai:/);
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('image/jpeg');
      expect(active_manifest?.signature_info?.issuer).toEqual(
        'C2PA Test Signing Cert',
      );
      expect(active_manifest?.signature_info?.cert_serial_number).toEqual(
        '640229841392226413189608867977836244731148734950',
      );

      const actionsAssertion = active_manifest?.assertions.filter(
        (x: ManifestAssertion) => x.label === 'c2pa.actions',
      );
      expect(actionsAssertion?.length).toEqual(1);
      expect(actionsAssertion?.[0]?.data.actions.length).toEqual(1);
      expect(actionsAssertion?.[0]?.data.actions[0].action).toEqual(
        'c2pa.created',
      );
      expect(actionsAssertion?.[0]?.data.actions[0].parameters).toBeUndefined();

      const customAssertion = active_manifest?.assertions.filter(
        (x: ManifestAssertion) => x.label === 'com.custom.my-assertion',
      );
      expect(customAssertion?.length).toEqual(1);
      expect(customAssertion?.[0]?.data.description).toEqual(
        'My custom test assertion',
      );
      expect(customAssertion?.[0]?.data.version).toEqual('1.0.0');

      const ingredients = active_manifest?.ingredients;
      expect(ingredients?.length).toEqual(0);

      expect(validation_status.length).toEqual(0);
    });

    test('should sign an unsigned MP4 video with an embedded manifest from a file', async () => {
      const asset = { path: resolve('tests/fixtures/earth.mp4') };
      const outputPath = temporaryFile({ name: 'earth-signed.mp4' });
      const manifest = new ManifestBuilder(
        {
          claim_generator: 'my-app/1.0.0',
          format: 'video/mp4',
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
      const { signedAsset } = await c2pa.sign({
        asset,
        manifest,
        thumbnail: false,
        options: {
          outputPath,
        },
      });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(1);

      // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.label).toMatch(/^cai:/);
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('video/mp4');
      expect(active_manifest?.signature_info?.issuer).toEqual(
        'C2PA Test Signing Cert',
      );
      expect(active_manifest?.signature_info?.cert_serial_number).toEqual(
        '640229841392226413189608867977836244731148734950',
      );

      const actionsAssertion = active_manifest?.assertions.filter(
        (x: ManifestAssertion) => x.label === 'c2pa.actions',
      );
      expect(actionsAssertion?.length).toEqual(1);
      expect(actionsAssertion?.[0]?.data.actions.length).toEqual(1);
      expect(actionsAssertion?.[0]?.data.actions[0].action).toEqual(
        'c2pa.created',
      );
      expect(actionsAssertion?.[0]?.data.actions[0].parameters).toBeUndefined();

      const customAssertion = active_manifest?.assertions.filter(
        (x: ManifestAssertion) => x.label === 'com.custom.my-assertion',
      );
      expect(customAssertion?.length).toEqual(1);
      expect(customAssertion?.[0]?.data.description).toEqual(
        'My custom test assertion',
      );
      expect(customAssertion?.[0]?.data.version).toEqual('1.0.0');

      const ingredients = active_manifest?.ingredients;
      expect(ingredients?.length).toEqual(0);

      expect(validation_status.length).toEqual(0);
    });

    test('should throw an error if trying to sign an MP4 file from a buffer', async () => {
      const fixture = await readFile('tests/fixtures/earth.mp4');
      const asset: Asset = { buffer: fixture, mimeType: 'video/mp4' };
      const manifest = new ManifestBuilder(
        {
          claim_generator: 'my-app/1.0.0',
          format: 'video/mp4',
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
      expect(
        c2pa.sign({
          asset,
          manifest,
          thumbnail: false,
        }),
      ).rejects.toThrow();
    });

    test('should append a claim to a JPEG image with an existing manifest', async () => {
      const fixture = await readFile('tests/fixtures/CAICAI.jpg');
      const asset: Asset = { buffer: fixture, mimeType: 'image/jpeg' };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const { signedAsset } = await c2pa.sign({
        asset,
        manifest,
      });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(3);

      // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('image/jpeg');

      const ingredients = active_manifest?.ingredients;
      expect(ingredients?.length).toEqual(1);

      const parentIngredient = ingredients?.[0];
      const parentManifest = manifests[parentIngredient?.active_manifest];
      expect(parentIngredient?.title).toEqual('CAICAI.jpg');
      expect(parentIngredient?.format).toEqual('image/jpeg');
      expect(parentIngredient?.relationship).toEqual('parentOf');
      expect(parentIngredient?.validation_status).toBeUndefined();
      expect(parentManifest.claim_generator).toEqual(
        'make_test_images/0.24.0 c2pa-rs/0.24.0',
      );

      expect(validation_status.length).toEqual(0);
    });

    test('should sign a file without an extension', async () => {
      const fixture = resolve('tests/fixtures/CAICAI');
      const asset: Asset = { path: fixture, mimeType: 'image/jpeg' };
      const outputPath = temporaryFile({ name: 'no-extension.jpg' });
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const { signedAsset } = await c2pa.sign({
        asset,
        manifest,
        options: {
          outputPath,
        },
      });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(3);

      // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('image/jpeg');

      expect(validation_status.length).toEqual(0);
    });

    test('should throw an error if trying to sign an file without an output path', async () => {
      const fixture = resolve('tests/fixtures/CAICAI');
      const asset: Asset = { path: fixture, mimeType: 'image/jpeg' };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      expect(
        c2pa.sign({
          asset,
          manifest,
          thumbnail: false,
        }),
      ).rejects.toThrow();
    });

    test('should allow you to add an ingredient to a signed image', async () => {
      const fixture = await readFile('tests/fixtures/CAICAI.jpg');
      const ingredientFixture = await readFile('tests/fixtures/A.jpg');
      const asset: Asset = { buffer: fixture, mimeType: 'image/jpeg' };
      const ingredientAsset = {
        buffer: ingredientFixture,
        mimeType: 'image/jpeg',
      };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const ingredient = await c2pa.createIngredient({
        asset: ingredientAsset,
        title: 'A-added.jpg',
      });
      manifest.addIngredient(ingredient);
      const { signedAsset } = await c2pa.sign({
        asset,
        manifest,
      });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(3);

      // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('image/jpeg');

      const ingredients = active_manifest?.ingredients;
      expect(ingredients?.length).toEqual(2);

      const parentIngredient = ingredients?.[0];
      const parentManifest = manifests[parentIngredient?.active_manifest];
      expect(parentIngredient?.title).toEqual('CAICAI.jpg');
      expect(parentIngredient?.format).toEqual('image/jpeg');
      expect(parentIngredient?.relationship).toEqual('parentOf');
      expect(parentIngredient?.validation_status).toBeUndefined();
      expect(parentManifest.claim_generator).toEqual(
        'make_test_images/0.24.0 c2pa-rs/0.24.0',
      );

      expect(validation_status.length).toEqual(0);
    });

    test.skip('should allow you to specify a remote manifest', async () => {
      // TODO: Create a function that gives back the remote manifest URL if it exists
      const fixture = await readFile('tests/fixtures/CAICAI.jpg');
      const asset: Asset = { buffer: fixture, mimeType: 'image/jpeg' };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const remoteManifestUrl = 'https://remote-manifest.storage/manifest.c2pa';
      const { signedAsset } = await c2pa.sign({
        asset,
        manifest,
        options: { remoteManifestUrl },
      });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      console.log('result', result);

      // Manifests
      expect(Object.keys(manifests).length).toEqual(3);

      // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('image/jpeg');

      const ingredients = active_manifest?.ingredients;
      expect(ingredients?.length).toEqual(2);

      const parentIngredient = ingredients?.[0];
      const parentManifest = manifests[parentIngredient?.active_manifest];
      expect(parentIngredient?.title).toEqual('CAICAI.jpg');
      expect(parentIngredient?.format).toEqual('image/jpeg');
      expect(parentIngredient?.relationship).toEqual('parentOf');
      expect(parentIngredient?.validation_status).toBeUndefined();
      expect(parentManifest.claim_generator).toEqual(
        'make_test_images/0.24.0 c2pa-rs/0.24.0',
      );

      expect(validation_status.length).toEqual(0);
    });
  });

  describe('remote signing', () => {
    let mockRemoteService: Scope;

    afterEach(async () => {
      nock.restore();
    });

    test('should sign an unsigned JPEG image with an embedded manifest', async () => {
      mockRemoteService = createSuccessRemoteServiceMock();
      const signer = createRemoteSigner();
      const c2pa = createC2pa({
        signer,
      });
      const fixture = await readFile('tests/fixtures/A.jpg');
      const asset: Asset = { buffer: fixture, mimeType: 'image/jpeg' };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const { signedAsset } = await c2pa.sign({
        asset,
        manifest,
      });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(1);

      // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('image/jpeg');
      expect(active_manifest?.signature_info?.issuer).toEqual(
        'C2PA Test Signing Cert',
      );
      expect(active_manifest?.signature_info?.cert_serial_number).toEqual(
        '640229841392226413189608867977836244731148734950',
      );

      expect(validation_status.length).toEqual(0);

      // Calls should be made to the mock service
      expect(mockRemoteService.isDone()).toBeTruthy();
    });

    test('should be able to override the signer during the sign call', async () => {
      mockRemoteService = createSuccessRemoteServiceMock();
      const signer = createRemoteSigner();
      const c2pa = createC2pa({
        signer,
      });
      const fixture = await readFile('tests/fixtures/A.jpg');
      const asset: Asset = { buffer: fixture, mimeType: 'image/jpeg' };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const { signedAsset } = await c2pa.sign({
        asset,
        manifest,
        signer: await createTestSigner({
          certificatePath: 'tests/fixtures/certs/es256.pub',
          privateKeyPath: 'tests/fixtures/certs/es256.pem',
        }),
      });

      await c2pa.read(signedAsset);

      // Calls should not be made to the mock service
      expect(mockRemoteService.isDone()).toBeFalsy();
    });
  });
});
