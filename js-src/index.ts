import {
  createIngredientFunction,
  createSign,
  read,
  signClaimBytes,
} from './bindings';
import { Algorithm as HashAlgorithm } from './lib/hash';
import type { Signer } from './lib/signer';
import type { ThumbnailOptions } from './lib/thumbnail';

export type C2paOptions = {
  signer?: Signer;
  thumbnail?: ThumbnailOptions | false | null;
  ingredientHashAlgorithm?: HashAlgorithm;
};

const defaultOptions: C2paOptions = {};

export type C2pa = ReturnType<typeof createC2pa>;

export function createC2pa(options?: C2paOptions) {
  const opts: C2paOptions = Object.assign({}, defaultOptions, options);

  return {
    createIngredient: createIngredientFunction(opts),
    read,
    sign: createSign(opts),
    signClaimBytes,
  };
}

export type {
  Asset,
  IngredientResourceStore,
  SignClaimBytesProps,
  SignProps,
  StorableIngredient,
} from './bindings';
export { ManifestBuilder } from './lib/manifestBuilder';
export { Signer, SigningAlgorithm, createTestSigner } from './lib/signer';
