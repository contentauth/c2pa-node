import { read, sign, signClaimBytes } from './bindings';
import { MissingSignerError } from './lib/error';
import type { Signer } from './lib/signer';

export type C2paOptions = {
  signer?: Signer;
};

const defaultOptions: C2paOptions = {};

export type C2pa = ReturnType<typeof createC2pa>;

export type SignProps = Omit<Parameters<typeof sign>[0], 'options'>;

export function createC2pa(options?: C2paOptions) {
  const opts: C2paOptions = Object.assign({}, defaultOptions, options);

  return {
    read,

    async sign(args: SignProps) {
      if (!opts.signer) {
        throw new MissingSignerError();
      }

      return sign({
        ...args,
        options: opts,
      });
    },

    signClaimBytes,
  };
}

export { Asset } from './bindings';
export { ManifestBuilder } from './lib/manifestBuilder';
export { Signer, SigningAlgorithm, createTestSigner } from './lib/signer';
