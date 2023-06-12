import { readFile } from 'node:fs/promises';
import { C2pa, createC2pa } from '../dist/js-src/index';
import type { ManifestAssertion } from '../dist/js-src/types';

describe('readAsset()', () => {
  let c2pa: C2pa;

  beforeEach(() => {
    c2pa = createC2pa();
  });

  afterEach(async () => {
    await c2pa?.destroy();
  });

  test('should read a JPEG image with an embedded manifest', async () => {
    const fixture = await readFile('tests/fixtures/CAICAI.jpg');
    const result = await c2pa.read({ mimeType: 'image/jpeg', buffer: fixture });
    const { active_manifest, manifests, validation_status } = result!;

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

    // Ingredients
    expect(active_manifest?.ingredients?.length).toEqual(2);
    expect(active_manifest?.ingredients).toEqual(
      expect.arrayContaining([
        {
          title: 'A.jpg',
          format: 'image/jpeg',
          document_id: 'xmp.did:813ee422-9736-4cdc-9be6-4e35ed8e41cb',
          instance_id: 'xmp.iid:813ee422-9736-4cdc-9be6-4e35ed8e41cb',
          thumbnail: {
            format: 'image/jpeg',
            identifier: 'xmp.iid-813ee422-9736-4cdc-9be6-4e35ed8e41cb.jpg',
          },
          relationship: 'parentOf',
        },
        {
          title: 'CAI.jpg',
          format: 'image/jpeg',
          instance_id: 'xmp:iid:edc3339c-5e38-4449-b723-fe703254c4b4',
          thumbnail: {
            format: 'image/jpeg',
            identifier: 'xmp-iid-edc3339c-5e38-4449-b723-fe703254c4b4.jpg',
          },
          relationship: 'componentOf',
          active_manifest:
            'contentauth:urn:uuid:4fb77c8e-95f2-47a3-aa7a-adcd81b9cba7',
        },
      ]),
    );

    // Assertions
    expect(active_manifest?.assertions?.length).toEqual(2);
    // CreativeWork assertion
    expect(
      active_manifest?.assertions?.find(
        (x: ManifestAssertion) => x.label === 'stds.schema-org.CreativeWork',
      ),
    ).toMatchObject({
      label: 'stds.schema-org.CreativeWork',
      data: {
        '@context': 'http://schema.org/',
        '@type': 'CreativeWork',
        author: [
          {
            '@type': 'Person',
            name: 'Adobe make_test',
          },
        ],
      },
    });
    // Actions assertion
    expect(
      active_manifest?.assertions?.find(
        (x: ManifestAssertion) => x.label === 'c2pa.actions',
      ),
    ).toMatchObject({
      label: 'c2pa.actions',
      data: {
        actions: [
          {
            action: 'c2pa.opened',
            instanceId: 'xmp.iid:813ee422-9736-4cdc-9be6-4e35ed8e41cb',
            parameters: {
              ingredient: {
                url: 'self#jumbf=c2pa.assertions/c2pa.ingredient',
              },
            },
          },
          {
            action: 'c2pa.color_adjustments',
            parameters: {
              name: 'brightnesscontrast',
            },
          },
          {
            action: 'c2pa.placed',
            instanceId: 'xmp:iid:edc3339c-5e38-4449-b723-fe703254c4b4',
            parameters: {
              ingredient: {
                url: 'self#jumbf=c2pa.assertions/c2pa.ingredient__1',
              },
            },
          },
          {
            action: 'c2pa.resized',
          },
        ],
      },
    });

    // Signature
    expect(active_manifest?.signature_info?.issuer).toEqual(
      'C2PA Test Signing Cert',
    );
    expect(active_manifest?.signature_info?.time).toEqual(
      '2023-05-25T10:59:07+00:00',
    );
    expect(active_manifest?.signature_info?.timeObject).toEqual(
      new Date('2023-05-25T10:59:07+00:00'),
    );

    // Thumbnail
    expect(active_manifest?.thumbnail?.format).toEqual('image/jpeg');
    expect(active_manifest?.thumbnail?.data).toBeInstanceOf(ArrayBuffer);
    expect(active_manifest?.thumbnail?.data?.byteLength).toEqual(72217);

    // Validation status
    expect(validation_status.length).toEqual(0);
  });

  test('should read a JPEG image with a cloud manifest', async () => {
    const fixture = await readFile('tests/fixtures/cloud-only-firefly.jpg');
    const result = await c2pa.read({ mimeType: 'image/jpeg', buffer: fixture });
    const { active_manifest, manifests, validation_status } = result!;

    // Manifests
    expect(Object.keys(manifests).length).toEqual(4);
    expect(Object.keys(manifests)).toEqual(
      expect.arrayContaining([
        'adobe:fc42dcfb-12c4-47a1-af42-3be443142b39',
        'adobe:urn:uuid:381760d4-a96a-4d41-8afb-4a82ecf1845e',
        'adobe:82a2860a-fcda-4971-bfc1-8bc3decc2cd1',
        'adobe:5dd3c698-5e75-4344-ae57-4b4bc812c672',
      ]),
    );

    // Active manifest
    expect(active_manifest?.label).toEqual(
      'adobe:urn:uuid:381760d4-a96a-4d41-8afb-4a82ecf1845e',
    );
    expect(active_manifest?.claim_generator).toEqual(
      'Adobe_Photoshop/24.5.0 (build 20230410.m.2133 3783a7d; mac) cai-helper/0.4.8 c2pa-rs/0.13.0',
    );
    expect(active_manifest?.title).toEqual('cloud only firefly.jpg');
    expect(active_manifest?.format).toEqual('image/jpeg');
    expect(active_manifest?.instance_id).toEqual(
      'xmp:iid:50ccb33b-5ea1-4ec2-96c2-2f04a2e0fb76',
    );

    // Validation status
    expect(validation_status.length).toEqual(0);
  });

  test('should return null for an image with no manifest', async () => {
    const fixture = await readFile('tests/fixtures/A.jpg');
    const result = await c2pa.read({ mimeType: 'image/jpeg', buffer: fixture });

    expect(result).toBeNull();
  });

  test('should read a JPEG image that is OTGP', async () => {
    const fixture = await readFile('tests/fixtures/XCA.jpg');
    const result = await c2pa.read({ mimeType: 'image/jpeg', buffer: fixture });

    expect(result?.validation_status.length).toEqual(1);
    expect(result?.validation_status[0]).toMatchObject({
      code: 'assertion.dataHash.mismatch',
      url: 'self#jumbf=/c2pa/contentauth:urn:uuid:ee7fc739-e619-44d3-a110-c9ff5dd2588d/c2pa.assertions/c2pa.hash.data',
      explanation:
        'asset hash error, name: jumbf manifest, error: hash verification( Hashes do not match )',
    });
  });
});
