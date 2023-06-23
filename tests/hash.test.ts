import { readFile } from 'node:fs/promises';
import { sha } from '../js-src/lib/hash';

describe('sha()', () => {
  test.skip('should compute a proper hash', async () => {
    const fixture = await readFile('tests/fixtures/CAICAI.jpg');
    const digest = sha(fixture, 'sha384');

    expect(digest).toEqual(
      'sVINtK1arjyLR617Ta85vNXO7X3uVpsFAKI/9Us4MWL7pDF51cTbfA55KH2BxJYh',
    );
  });
});
