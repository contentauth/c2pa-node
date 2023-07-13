/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { extname } from 'node:path';
import { Readable } from 'node:stream';
import type { Asset } from '../bindings';
import type { ResourceRef } from '../types';

export type Algorithm = 'sha256' | 'sha384' | 'sha512';

const DEFAULT_ALG: Algorithm = 'sha384';

/**
 * Calculates the SHA of a buffer or file path as base64
 */
export function sha(data: Buffer | string, algorithm: Algorithm = DEFAULT_ALG) {
  const hash = createHash(algorithm);
  let input =
    typeof data === 'string' ? createReadStream(data) : Readable.from(data);

  return new Promise((resolve, reject) => {
    input
      .pipe(hash)
      .setEncoding('base64')
      .on('finish', () => {
        resolve(hash.read());
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

export async function labeledSha(
  asset: Asset,
  algorithm: Algorithm = DEFAULT_ALG,
) {
  let hash, suffix;

  if ('path' in asset) {
    hash = await sha(asset.path, algorithm);
    suffix = extname(asset.path).slice(1) || 'bin';
  } else {
    hash = await sha(asset.buffer, algorithm);
    suffix = asset.mimeType.split('/')[1] ?? 'bin';
  }

  return `${algorithm}-${hash}.${suffix}`;
}

export async function getResourceReference(
  asset: Asset,
  identifier: string | undefined,
  algorithm: Algorithm = DEFAULT_ALG,
): Promise<ResourceRef> {
  const suffix = asset.mimeType?.split('/')[1] ?? 'bin';
  const base =
    identifier?.replace(/[^a-z0-9\-]+/gi, '-') ??
    (await labeledSha(asset, algorithm));

  return {
    format: asset.mimeType ?? 'application/octet-stream',
    identifier: `${base}.${suffix}`,
  };
}
