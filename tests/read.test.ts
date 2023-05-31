import { readFile } from 'node:fs/promises';
import { readAsset } from '../js-src';

describe('readAsset()', () => {
  test('should read a JPEG image with an embedded manifest', async () => {
    const fixture = await readFile('tests/fixtures/CAICAI.jpg');
    const { active_manifest, manifests } = await readAsset(
      'image/jpeg',
      fixture,
    );

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
        (x) => x.label === 'stds.schema-org.CreativeWork',
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
      active_manifest?.assertions?.find((x) => x.label === 'c2pa.actions'),
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
    const thumbnail = active_manifest?.resolveResource(
      active_manifest.thumbnail!,
    );
    expect(thumbnail?.format).toEqual('image/jpeg');
    expect(thumbnail?.data).toBeInstanceOf(Buffer);
    expect(thumbnail?.data?.length).toEqual(72217);
  });

  test.skip('should read a JPEG image with a cloud manifest', async () => {
    const fixture = await readFile('tests/fixtures/cloud-only-firefly.jpg');
    try {
      const result = await readAsset('image/jpeg', fixture);
      console.log('result', result);
    } catch (err) {
      console.log('err', err);
    }
  });

  test('should read a JPEG image that is OTGP', async () => {
    const fixture = await readFile('tests/fixtures/XCA.jpg');
    const result = await readAsset('image/jpeg', fixture);

    expect(result.validation_status.length).toEqual(1);
    expect(result.validation_status[0]).toMatchObject({
      code: 'assertion.dataHash.mismatch',
      url: 'self#jumbf=/c2pa/contentauth:urn:uuid:ee7fc739-e619-44d3-a110-c9ff5dd2588d/c2pa.assertions/c2pa.hash.data',
      explanation:
        'asset hash error, name: jumbf manifest, error: hash verification( Hashes do not match )',
    });
  });
});
