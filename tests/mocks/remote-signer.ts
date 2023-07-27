/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import nock from 'nock';
import fetch, { Headers } from 'node-fetch';
import { createC2pa, createTestSigner, type Signer } from '../../dist/js-src';

export const BOX_SIZE = 10248;
export const MOCK_HOST = 'https://mock-signing.service';

export function createSuccessRemoteServiceMock(host = MOCK_HOST) {
  return (
    nock(host)
      // Reserve size
      .get('/box-size')
      .reply(200, { boxSize: BOX_SIZE })

      // Signer
      .post('/sign')
      .query({
        boxSize: BOX_SIZE,
      })
      .reply(200, async (_, requestBody) => {
        const signer = await createTestSigner({
          certificatePath: 'tests/fixtures/certs/es256.pub',
          privateKeyPath: 'tests/fixtures/certs/es256.pem',
        });
        const c2pa = createC2pa({ signer });
        const claim = Buffer.from(requestBody.toString(), 'hex');

        return c2pa.signClaimBytes({
          claim,
          reserveSize: BOX_SIZE,
          signer,
        });
      })
  );
}

export function createRemoteSigner(): Signer {
  return {
    type: 'remote',
    async reserveSize() {
      const url = `${MOCK_HOST}/box-size`;
      const res = await fetch(url);
      const data = (await res.json()) as { boxSize: number };
      return data.boxSize;
    },
    async sign({ reserveSize, toBeSigned }) {
      const url = `${MOCK_HOST}/sign?boxSize=${reserveSize}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/octet-stream',
        }),
        body: toBeSigned,
      });
      return res.buffer();
    },
  };
}
