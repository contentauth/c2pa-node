import { readFile } from 'node:fs/promises';
import {
  Asset,
  C2pa,
  ManifestBuilder,
  createC2pa,
  createTestSigner,
} from '../dist/js-src/index';

describe('sign()', () => {
  describe('local signing', () => {
    let c2pa: C2pa;

    beforeEach(async () => {
      const signer = await createTestSigner();
      c2pa = createC2pa({
        signer,
      });
    });

    afterEach(async () => {
      await c2pa?.destroy();
    });

    test('should sign an unsigned JPEG image with an embedded manifest', async () => {
      const fixture = await readFile('tests/fixtures/A.jpg');
      const asset: Asset = { mimeType: 'image/jpeg', buffer: fixture };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const signed = await c2pa.sign({ asset, manifest });

      const result = await c2pa.read({
        mimeType: 'image/jpeg',
        buffer: signed.buffer,
      });
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
    });

    // TODO: Add proper assertions
    test.skip('should append a claim to a JPEG image with an existing manifest', async () => {
      const fixture = await readFile('tests/fixtures/CAICAI.jpg');
      const asset: Asset = { mimeType: 'image/jpeg', buffer: fixture };
      const manifest = new ManifestBuilder({
        claim_generator: 'my-app/1.0.0',
        format: 'image/jpeg',
        title: 'node_test_local_signer.jpg',
      });
      const signed = await c2pa.sign({ asset, manifest });

      const result = await c2pa.read({
        mimeType: 'image/jpeg',
        buffer: signed.buffer,
      });
      console.log('result', result);
      const { active_manifest, manifests, validation_status } = result!;

      // Manifests
      expect(Object.keys(manifests).length).toEqual(1);

      // // Active manifest
      expect(active_manifest?.claim_generator).toMatch(
        /^my-app\/1.0.0 c2pa-node\//,
      );
      expect(active_manifest?.title).toEqual('node_test_local_signer.jpg');
      expect(active_manifest?.format).toEqual('image/jpeg');
    });
  });

  describe('remote signing', () => {});
});
