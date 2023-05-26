import test from 'ava';
import { readFile } from 'node:fs/promises';
import { readAsset } from '../js-src';

test('read works', async (t) => {
  const fixture = await readFile('./fixtures/CAICAI.jpg');
  const result = await readAsset('image/jpeg', fixture);
  console.log(result);
});
