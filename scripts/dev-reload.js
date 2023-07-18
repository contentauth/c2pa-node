/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

const chokidar = require('chokidar');
const chalk = require('chalk');
const { exec } = require('node:child_process');

const execCallback = (err, stdout, stderr) => {
  if (err) {
    console.error(chalk.bgRed('ERROR:') + ' ' + chalk.red(err));
  } else if (stdout) {
    console.log(stdout);
  } else if (stderr) {
    console.error(chalk.dim(stderr));
  }
};

async function rebuildTypeScript() {
  console.log(chalk.dim('📃 Rebuilding TypeScript...'));
  return new Promise((resolve, reject) => {
    const result = exec('pnpm run-s build:ts build:assets', execCallback);
    result.on('exit', (code) => {
      code === 0 ? resolve() : reject();
    });
  });
}

async function rebuildRust() {
  console.log(chalk.dim('🦀 Rebuilding Rust...'));
  return new Promise((resolve, reject) => {
    const result = exec(
      'npx cargo-cp-artifact -nc generated/c2pa.node -- cargo build --message-format=json-render-diagnostics',
      execCallback,
    );
    result.on('exit', (code) => {
      code === 0 ? resolve() : reject();
    });
  });
}

async function main() {
  console.log(chalk.yellow('🛠️  Creating an initial build...'));
  try {
    await rebuildRust();
    await rebuildTypeScript();
  } catch (err) {
    console.error('Error with initial build:', err);
  }
  console.log(chalk.yellow('👀 Watching for changes...'));

  chokidar
    .watch(['generated/c2pa.node', '{src,js-src,tests/mocks}/**/*.{js,ts,rs}'])
    .on('change', (path) => {
      if (/\.rs$/i.test(path)) {
        rebuildRust();
      } else {
        rebuildTypeScript();
      }
    });
}

main();
