import { readFile } from 'node:fs/promises';
import {
  Asset,
  C2pa,
  ManifestBuilder,
  createC2pa,
  createTestSigner,
} from '../dist/js-src/index';

describe('sign()', () => {
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

  test('should sign a file JPEG image with an embedded manifest', async () => {
    const fixture = await readFile('tests/fixtures/CAICAI.jpg');
    const asset: Asset = { mimeType: 'image/jpeg', buffer: fixture };
    const manifest = new ManifestBuilder({
      claim_generator: 'my-app/1.0.0',
      format: 'image/jpeg',
    });
    const signed = await c2pa.sign({ asset, manifest });

    const result = await c2pa.read({
      mimeType: 'image/jpeg',
      buffer: signed.buffer,
    });
    const { active_manifest, manifests, validation_status } = result!;

    console.log('result', result);

    // Manifests
    expect(Object.keys(manifests).length).toEqual(2);
    expect(Object.keys(manifests)).toEqual(
      expect.arrayContaining([
        'contentauth:urn:uuid:4fb77c8e-95f2-47a3-aa7a-adcd81b9cba7',
        'contentauth:urn:uuid:4e8f1df8-8179-406c-91c7-0b9ecde31935',
      ]),
    );

    // Active manifest
    expect(active_manifest?.label).toEqual(
      'contentauth:urn:uuid:4e8f1df8-8179-406c-91c7-0b9ecde31935',
    );
    expect(active_manifest?.claim_generator).toEqual(
      'make_test_images/0.22.0 c2pa-rs/0.22.0',
    );
    expect(active_manifest?.title).toEqual('CAICAI.jpg');
    expect(active_manifest?.format).toEqual('image/jpeg');
    expect(active_manifest?.instance_id).toEqual(
      'xmp:iid:f9bff63a-016c-44d1-9ab1-9806b17ceeb5',
    );
  });
});
