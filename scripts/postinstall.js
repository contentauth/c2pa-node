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
  const distRoot = resolve('dist');
  const cargoDistPath = resolve(distRoot, 'Cargo.toml');
  const libraryOverridePath = process.env.C2PA_LIBRARY_PATH;

  if (libraryOverridePath && !fileExists(libraryOverridePath)) {
    process.error(`C2PA_LIBRARY_PATH (${libraryOverridePath}) doesn't exist`);
    process.exit(1);
  }

  if (fileExists(cargoDistPath) && !libraryOverridePath) {
    await buildRust(distRoot);
  } else {
    console.log('Skipping Rust build');
  }
}

main();
