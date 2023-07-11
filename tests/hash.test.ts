/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { readFile } from 'node:fs/promises';
import { sha } from '../js-src/lib/hash';

describe('sha()', () => {
  test('should compute a proper hash from a buffer', async () => {
    const fixture = await readFile('tests/fixtures/CAICAI.jpg');
    const digest = await sha(fixture, 'sha384');

    expect(digest).toEqual(
      'sVINtK1arjyLR617Ta85vNXO7X3uVpsFAKI/9Us4MWL7pDF51cTbfA55KH2BxJYh',
    );
  });

  test('should compute a proper hash from a file', async () => {
    const fixture = 'tests/fixtures/earth.mp4';
    const digest = await sha(fixture, 'sha384');

    expect(digest).toEqual(
      'wu6Xec763DjphkuxjytMxCTd5U3mv4W56iC4WGKwv21YrczwwKkCd1Z6h2+t7i/0',
    );
  });
});
