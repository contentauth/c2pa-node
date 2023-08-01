/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

const { stat } = require('node:fs/promises');
const { mkdirp } = require('mkdirp');
const { resolve } = require('node:path');
const { exec } = require('node:child_process');
const pkgDir = require('pkg-dir');
const downloadTestCerts = require('./lib/download-test-certs.js');
const { promisify } = require('node:util');

const pExec = promisify(exec);

const execCallback = (err, stdout, stderr) => {
  if (err) {
    console.error(`ERROR: ${err}`);
  } else if (stdout) {
    console.log(stdout);
  } else if (stderr) {
    console.error(stderr);
  }
};

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

async function rustExists() {
  try {
    await Promise.all([pExec('rustc --version'), pExec('cargo --version')]);
    return true;
  } catch (err) {
    return false;
  }
}

async function buildRust(root) {
  console.log('🦀 Building Rust...');
  const generatedDir = resolve(root, 'generated');
  const bindingsPath = resolve(generatedDir, 'c2pa.node');
  const cargoPath = resolve(root, 'Cargo.toml');
  await mkdirp(generatedDir);
  return new Promise((resolve, reject) => {
    const result = exec(
      `npx cargo-cp-artifact -nc "${bindingsPath}" -- cargo build --message-format=json-render-diagnostics --release --manifest-path="${cargoPath}"`,
      execCallback,
    );
    result.on('exit', (code) => {
      code === 0 ? resolve() : reject();
    });
  });
}

async function main() {
  const appRoot = await pkgDir(__dirname);
  const distRoot = resolve(appRoot, 'dist');
  const cargoDistPath = resolve(distRoot, 'Cargo.toml');
  const libraryOverridePath = process.env.C2PA_LIBRARY_PATH;
  const cargoDistPathExists = await fileExists(cargoDistPath);
  const rustToolchainExists = await rustExists();

  if (libraryOverridePath) {
    console.log('Skipping Rust build since C2PA_LIBRARY_PATH is set');
  } else if (!rustToolchainExists) {
    console.warn('Skipping Rust build since Rust and/or Cargo is not found');
  } else if (cargoDistPathExists) {
    await buildRust(distRoot);
  } else {
    await buildRust(appRoot);
  }

  downloadTestCerts();
}

main();
