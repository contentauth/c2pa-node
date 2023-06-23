import {
  createIngredientFunction,
  createSign,
  read,
  signClaimBytes,
} from './bindings';
import { Algorithm as HashAlgorithm } from './lib/hash';
import type { Signer } from './lib/signer';
import {
  defaultThumbnailOptions,
  type ThumbnailOptions,
} from './lib/thumbnail';

export type C2paOptions = {
  signer?: Signer;
  thumbnail?: ThumbnailOptions | false | null;
  ingredientHashAlgorithm?: HashAlgorithm;
};

const defaultOptions: C2paOptions = {
  thumbnail: defaultThumbnailOptions,
};

export type C2pa = {
  createIngredient: ReturnType<typeof createIngredientFunction>;
  read: typeof read;
  sign: ReturnType<typeof createSign>;
  signClaimBytes: typeof signClaimBytes;
};

/**
 * Creates an instance of the SDK that encompasses a set of global options
 * @param options Global options for the C2PA instance
 * @returns
 */
export function createC2pa(options?: C2paOptions) {
  const opts: C2paOptions = Object.assign({}, defaultOptions, options);

  return {
    createIngredient: createIngredientFunction(opts),
    read,
    sign: createSign(opts),
    signClaimBytes,
  } as C2pa;
}

export type {
  Asset,
  CreateIngredientProps,
  IngredientResourceStore,
  ResolvedIngredient,
  ResolvedManifest,
  ResolvedManifestStore,
  ResolvedResource,
  ResolvedSignatureInfo,
  SignClaimBytesProps,
  SignOptions,
  SignOutput,
  SignProps,
  StorableIngredient,
} from './bindings';
export type { Algorithm as HashAlgorithm } from './lib/hash';
export { ManifestBuilder } from './lib/manifestBuilder';
export {
  LocalSigner,
  RemoteSigner,
  SignInput,
  Signer,
  SigningAlgorithm,
  createTestSigner,
} from './lib/signer';
export type { ThumbnailOptions } from './lib/thumbnail';
export type { Ingredient, Manifest } from './types';
