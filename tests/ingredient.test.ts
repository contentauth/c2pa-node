/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { C2pa, createC2pa } from '../dist/js-src/index';

const instanceIdMatcher = /xmp(?:\:|\.)iid:\w{8}\-\w{4}-4\w{3}-\w{4}-\w{12}/i;
const identifierMatcher =
  /xmp-iid-\w{8}\-\w{4}-4\w{3}-\w{4}-\w{12}(\.\w{3,4})/i;

describe('createIngredient()', () => {
  let c2pa: C2pa;

  beforeEach(() => {
    c2pa = createC2pa();
  });

  describe('from buffer', () => {
    test('should read a JPEG image with an embedded manifest', async () => {
      const fixture = await readFile('tests/fixtures/CAICAI.jpg');
      const asset = {
        buffer: fixture,
        mimeType: 'image/jpeg',
      };
      const { ingredient, resources } = await c2pa.createIngredient({
        asset,
        title: 'test-ingredient.jpg',
      });

      expect(ingredient.title).toEqual('test-ingredient.jpg');
      expect(ingredient.format).toEqual('image/jpeg');
      expect(ingredient.instance_id).toMatch(instanceIdMatcher);
      expect(ingredient.thumbnail?.format).toEqual('image/jpeg');
      expect(ingredient.thumbnail?.identifier).toMatch(identifierMatcher);
      expect(ingredient.relationship).toEqual('componentOf');
      expect(ingredient.active_manifest).toEqual(
        'contentauth:urn:uuid:699750af-e07b-4c45-9d24-a131442111b8',
      );
      expect(ingredient.manifest_data?.format).toEqual('c2pa');
      expect(ingredient.manifest_data?.identifier).toMatch(identifierMatcher);
      expect(ingredient.hash).toEqual(
        'sha384-sVINtK1arjyLR617Ta85vNXO7X3uVpsFAKI/9Us4MWL7pDF51cTbfA55KH2BxJYh.jpeg',
      );

      expect(Object.keys(resources).length).toEqual(2);
      expect(resources[ingredient.thumbnail!.identifier].byteLength).toEqual(
        72217,
      );
      expect(
        resources[ingredient.manifest_data!.identifier].byteLength,
      ).toEqual(585508);
    });
  });

  describe('from file', () => {
    test('should read a JPEG image with an embedded manifest', async () => {
      const asset = {
        path: resolve('tests/fixtures/CAICAI.jpg'),
      };
      const { ingredient, resources } = await c2pa.createIngredient({
        asset,
        title: 'test-ingredient.jpg',
      });

      expect(ingredient.title).toEqual('test-ingredient.jpg');
      expect(ingredient.format).toEqual('image/jpeg');
      expect(ingredient.instance_id).toMatch(instanceIdMatcher);
      expect(ingredient.thumbnail?.format).toEqual('image/jpeg');
      expect(ingredient.thumbnail?.identifier).toMatch(identifierMatcher);
      expect(ingredient.relationship).toEqual('componentOf');
      expect(ingredient.active_manifest).toEqual(
        'contentauth:urn:uuid:699750af-e07b-4c45-9d24-a131442111b8',
      );
      expect(ingredient.manifest_data?.format).toEqual('c2pa');
      expect(ingredient.manifest_data?.identifier).toMatch(identifierMatcher);
      expect(ingredient.hash).toEqual(
        'sha384-sVINtK1arjyLR617Ta85vNXO7X3uVpsFAKI/9Us4MWL7pDF51cTbfA55KH2BxJYh.jpg',
      );

      expect(Object.keys(resources).length).toEqual(2);
      expect(resources[ingredient.thumbnail!.identifier].byteLength).toEqual(
        72217,
      );
      expect(
        resources[ingredient.manifest_data!.identifier].byteLength,
      ).toEqual(585508);
    });
  });
});
