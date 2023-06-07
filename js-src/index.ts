import path from 'node:path';
import Piscina from 'piscina';
import { readAsset } from './lib/bindings';

const piscina = new Piscina({
  filename: path.join(__dirname, 'lib', 'bindings.js'),
});
