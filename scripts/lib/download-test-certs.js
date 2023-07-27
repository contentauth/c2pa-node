/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

const chalk = require('chalk');
const https = require('https');
const fs = require('fs');
const pkgDir = require('pkg-dir');
const { resolve } = require('node:path');

const pemUrl =
  'https://raw.githubusercontent.com/contentauth/c2pa-rs/main/sdk/tests/fixtures/certs/es256.pem';
const pubUrl =
  'https://raw.githubusercontent.com/contentauth/c2pa-rs/main/sdk/tests/fixtures/certs/es256.pub';

async function downloadTestCerts() {
  const appRoot = await pkgDir(__dirname);
  const fixtureRoot = resolve(appRoot, 'tests/fixtures/certs');
  const pemFile = fs.createWriteStream(resolve(fixtureRoot, 'es256.pem'));
  const pubFile = fs.createWriteStream(resolve(fixtureRoot, 'es256.pub'));

  console.log(chalk.yellow('Downloading test certificates...'));
  https.get(pemUrl, (res) => {
    res.pipe(pemFile);

    pemFile.on('finish', () => {
      pemFile.close();
      console.log(chalk.yellow('Downloaded es256.pem'));
    });
  });

  https.get(pubUrl, (res) => {
    res.pipe(pubFile);

    pubFile.on('finish', () => {
      pubFile.close();
      console.log(chalk.yellow('Downloaded es256.pub'));
    });
  });
}

module.exports = downloadTestCerts;
