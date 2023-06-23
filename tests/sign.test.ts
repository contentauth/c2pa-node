import nock, { type Scope } from 'nock';
import { readFile, writeFile } from 'node:fs/promises';
import {
  Asset,
  C2pa,
  ManifestBuilder,
  createC2pa,
  createTestSigner,
} from '../dist/js-src/index';
import {
  createRemoteSigner,
  createSuccessRemoteServiceMock,
} from './mocks/remote-signer';

describe('sign()', () => {
  describe('local signing', () => {
    let c2pa: C2pa;

    beforeEach(async () => {
      const signer = await createTestSigner();
      c2pa = createC2pa({
        signer,
      });
    });

    test('should sign an unsigned JPEG image with an embedded manifest', async () => {
      const fixture = await readFile('tests/fixtures/A.jpg');
      const asset: Asset = { mimeType: 'image/jpeg', buffer: fixture };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const { signedAsset } = await c2pa.sign({ asset, manifest });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;
      console.log('active_manifest', active_manifest);

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
    });

    test('should append a claim to a JPEG image with an existing manifest', async () => {
      const fixture = await readFile('tests/fixtures/CAICAI.jpg');
      const asset: Asset = { mimeType: 'image/jpeg', buffer: fixture };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const { signedAsset } = await c2pa.sign({ asset, manifest });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(3);

      // // Active manifest
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

    test.only('should allow you to add an ingredient to a signed image', async () => {
      const fixture = await readFile('tests/fixtures/CAICAI.jpg');
      const ingredientFixture = await readFile('tests/fixtures/A.jpg');
      const asset: Asset = { mimeType: 'image/jpeg', buffer: fixture };
      const ingredientAsset = {
        mimeType: 'image/jpeg',
        buffer: ingredientFixture,
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
      const { signedAsset } = await c2pa.sign({ asset, manifest });

      await writeFile(
        '/Users/dkozma/Downloads/test-sign-node-3.jpg',
        signedAsset.buffer,
      );

      const result = await c2pa.read(signedAsset);
      console.log('result', result);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(3);

      // // Active manifest
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
      mockRemoteService?.done();
      nock.restore();
    });

    test('should sign an unsigned JPEG image with an embedded manifest', async () => {
      mockRemoteService = createSuccessRemoteServiceMock();
      const signer = createRemoteSigner();
      const c2pa = createC2pa({
        signer,
      });
      const fixture = await readFile('tests/fixtures/A.jpg');
      const asset: Asset = { mimeType: 'image/jpeg', buffer: fixture };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const { signedAsset } = await c2pa.sign({ asset, manifest });

      const result = await c2pa.read(signedAsset);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(1);

      // // Active manifest
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
    });
  });
});
