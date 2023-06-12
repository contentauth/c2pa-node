const chokidar = require('chokidar');
const chalk = require('chalk');
const { exec } = require('node:child_process');
const path = require('node:path');

const execCallback = (err, stdout, stderr) => {
  if (err) {
    console.error(chalk.bgRed('ERROR:') + ' ' + chalk.red(err));
  } else if (stdout) {
    console.log(stdout);
  } else if (stderr) {
    console.error(chalk.dim(stderr));
  }
};

function getEnv() {
  const rootDir = path.resolve(__dirname, '..');
  return {
    ...process.env,
    NODE_ENV: 'development',
    BINDINGS_PATH: path.join(rootDir, '.ts-node/js-src/bindings.js'),
    C2PA_LIBRARY_PATH: path.join(rootDir, 'generated/c2pa.node'),
  };
}

async function rebuildTypeScript() {
  console.log(chalk.dim('📃 Rebuilding TypeScript...'));
  return new Promise((resolve, reject) => {
    const result = exec(
      'npx ts-node -H --emit ./js-src/index.ts',
      { env: getEnv() },
      execCallback,
    );
    result.on('exit', (code) => {
      code === 0 ? resolve() : reject();
    });
  });
}

async function buildBindings() {
  console.log(chalk.dim('🪢  Building bindings...'));
  return new Promise((resolve, reject) => {
    const result = exec(
      'npx ts-node -H --emit ./js-src/bindings.ts',
      { env: getEnv() },
      execCallback,
    );
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
    await buildBindings();
    rebuildTypeScript();
  } catch (err) {
    console.error('Error with initial build:', err);
  }
  console.log(chalk.yellow('👀 Watching for changes...'));

  chokidar
    .watch(['index.node', '{src,js-src}/**.{js,ts,rs}'])
    .on('change', (path) => {
      if (/\.rs$/i.test(path)) {
        rebuildRust();
      } else {
        rebuildTypeScript();
      }
    });
}

main();
