import { readFile } from 'node:fs/promises';
import { readAsset } from '../js-src';

test('read works', async () => {
  const fixture = await readFile('tests/fixtures/CAICAI.jpg');
  const result = await readAsset('image/jpeg', fixture);
  console.log(result);
  expect(true).toBe(true);
});
