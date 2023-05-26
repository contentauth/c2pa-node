import buffer from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { readAsset } from './bindings';

async function main() {
  const fixture = await readFile('./tests/fixtures/CAICAI.jpg');
  const result = await readAsset('image/jpeg', fixture);
  console.log('result', result);
}

main();
