/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import pkgDir from 'pkg-dir';

export enum SigningAlgorithm {
  // ECDSA with SHA-256
  ES256 = 'es256',
  // ECDSA with SHA-384
  ES384 = 'es384',
  // ECDSA with SHA-512
  ES512 = 'es512',
  // RSASSA-PSS using SHA-256 and MGF1 with SHA-256
  PS256 = 'ps256',
  // RSASSA-PSS using SHA-384 and MGF1 with SHA-384
  PS384 = 'ps384',
  // RSASSA-PSS using SHA-512 and MGF1 with SHA-512
  PS512 = 'ps512',
  // Edwards-Curve DSA (Ed25519 instance only)
  Ed25519 = 'ed25519',
}

export interface LocalSigner {
  type: 'local';
  certificate: Buffer;
  privateKey: Buffer;
  algorithm?: SigningAlgorithm;
  tsaUrl?: string;
}

export interface SignInput {
  reserveSize: number;
  toBeSigned: Buffer;
}

export interface RemoteSigner {
  type: 'remote';
  reserveSize: () => Promise<number>;
  sign: (input: SignInput) => Promise<Buffer>;
}

export type Signer = LocalSigner | RemoteSigner;

interface TestSignerOptions {
  certificatePath: string;
  privateKeyPath: string;
}

const packageRoot = pkgDir.sync(__dirname) ?? '';

const defaultTestSignerOptions: TestSignerOptions = {
  certificatePath: resolve(packageRoot, 'tests/fixtures/certs/es256.pub'),
  privateKeyPath: resolve(packageRoot, 'tests/fixtures/certs/es256.pem'),
};

export async function createTestSigner({
  certificatePath,
  privateKeyPath,
}: TestSignerOptions = defaultTestSignerOptions): Promise<LocalSigner> {
  const [certificate, privateKey] = await Promise.all([
    readFile(resolve(process.cwd(), certificatePath)),
    readFile(resolve(process.cwd(), privateKeyPath)),
  ]);

  return {
    type: 'local',
    certificate,
    privateKey,
    algorithm: SigningAlgorithm.ES256,
    tsaUrl: 'http://timestamp.digicert.com',
  };
}
