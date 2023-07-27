/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { createIngredientFunction, createSign, read } from './bindings';
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

export type C2pa = ReturnType<typeof createSign> & {
  createIngredient: ReturnType<typeof createIngredientFunction>;
  read: typeof read;
};

/**
 * Creates an instance of the SDK that encompasses a set of global options
 * @param options Global options for the C2PA instance
 * @returns
 */
export function createC2pa(options?: C2paOptions) {
  const opts: C2paOptions = Object.assign({}, defaultOptions, options);
  const signFns = createSign(opts);

  return {
    createIngredient: createIngredientFunction(opts),
    read,
    ...signFns,
  } as C2pa;
}

export type {
  Asset,
  BufferAsset,
  CreateIngredientProps,
  FileAsset,
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
export { ManifestBuilder, BaseManifestDefinition } from './lib/manifestBuilder';
export {
  LocalSigner,
  RemoteSigner,
  SignInput,
  Signer,
  SigningAlgorithm,
  createTestSigner,
} from './lib/signer';
export type { ThumbnailOptions } from './lib/thumbnail';
export type * as types from './types';
