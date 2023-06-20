import fetch, { Headers } from 'node-fetch';
import { readFile } from 'node:fs/promises';
import {
  Asset,
  C2pa,
  ManifestBuilder,
  Signer,
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

  describe.skip('remote signing', () => {
    let c2pa: C2pa;
    // let httpMocks: Record<string, Interceptor> = {};

    beforeEach(async () => {
      // httpMocks = {
      //   reserveSize: nock('https://signing.service.test/v1/reserve-size'),
      // };
      const host = `https://cai-stage.adobe.io`;
      const signer: Signer = {
        type: 'remote',
        async reserveSize() {
          const url = `${host}/signature/box_size/v1`;
          const res = await fetch(url, {
            headers: new Headers({
              'x-api-key': 'cai-desktop-helper',
              Authorization: `Bearer ${process.env.STAGE_ACCESS_TOKEN}`,
            }),
          });
          const data = (await res.json()) as { box_size: number };
          console.log('reserveSize data', data);
          return data.box_size;
        },
        async sign({ reserveSize, toBeSigned }) {
          const url = `${host}/manifest/sign/v2?box_size=${reserveSize}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: new Headers({
              'x-api-key': 'cai-desktop-helper',
              Authorization: `Bearer ${process.env.STAGE_ACCESS_TOKEN}`,
            }),
            body: toBeSigned,
          });
          return Buffer.from(await res.arrayBuffer());
        },
      };
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
  });
});
