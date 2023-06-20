import { Sign } from 'node:crypto';
import path from 'node:path';
import Piscina from 'piscina';
import { read, sign } from './bindings';
import { MissingSignerError } from './lib/error';
import type { Signer } from './lib/signer';

type WorkerOptions = ConstructorParameters<typeof Piscina>[0];

export type C2paOptions = {
  worker?: WorkerOptions;
  signer?: Signer;
};

const defaultOptions: C2paOptions = {
  worker: {
    idleTimeout: 60000, // 1 minute
  },
};

export type C2pa = ReturnType<typeof createC2pa>;

export type ReadProps = Parameters<typeof read>[0];
export type SignProps = Omit<Parameters<typeof sign>[0], 'options'>;

export function createC2pa(options?: C2paOptions) {
  const opts: C2paOptions = Object.assign({}, defaultOptions, options);
  const piscina = new Piscina({
    ...opts.worker,
    filename: process.env.BINDINGS_PATH ?? path.join(__dirname, 'bindings.js'),
  });

  return {
    async read(args: ReadProps) {
      return piscina.run(args, {
        name: 'read',
        transferList: [args.buffer.buffer],
      });
    },

    async sign(args: SignProps) {
      if (!opts.signer) {
        throw new MissingSignerError();
      }
      const { manifest, ...otherArgs } = args;
      const argsWithOptions = {
        ...otherArgs,
        manifest: manifest.definition,
        options: opts,
      };
      console.log('argsWithOptions', argsWithOptions);

      return piscina.run(argsWithOptions, {
        name: 'sign',
        transferList: [args.asset.buffer.buffer],
      });
    },

    async destroy() {
      return piscina.destroy();
    },

    get workerPool() {
      return piscina;
    },
  };
}

export { Asset } from './bindings';
export { ManifestBuilder } from './lib/manifestBuilder';
export { Signer, SigningAlgorithm, createTestSigner } from './lib/signer';
