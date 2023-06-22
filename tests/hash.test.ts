import { readFile } from 'node:fs/promises';
import { sha } from '../js-src/lib/hash';

describe('sha()', () => {
  test('should compute a proper hash', async () => {
    const fixture = await readFile('tests/fixtures/CAICAI.jpg');
    const digest = await sha(fixture, 'sha384');

    console.log('digest', digest);
  });
});
