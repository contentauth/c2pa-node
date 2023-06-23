import { readFile } from 'node:fs/promises';

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

export async function createTestSigner(): Promise<Signer> {
  const [certificate, privateKey] = await Promise.all([
    readFile('tests/fixtures/es256_certs.pem'),
    readFile('tests/fixtures/es256_private.key'),
  ]);

  return {
    type: 'local',
    certificate,
    privateKey,
    algorithm: SigningAlgorithm.ES256,
    tsaUrl: 'http://timestamp.digicert.com',
  };
}
