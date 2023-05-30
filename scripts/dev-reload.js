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

function rebuildTypeScript() {
  exec('npx ts-node ./js-src/index.ts', execCallback);
}

function rebuildRust() {
  exec(
    'npx cargo-cp-artifact -nc generated/c2pa.node -- cargo build --message-format=json-render-diagnostics',
    execCallback,
  );
}

function main() {
  console.log(chalk.yellow('🛠️  Creating an initial build...'));
  rebuildTypeScript();
  rebuildRust();
  console.log(chalk.yellow('👀 Watching for changes...'));

  chokidar
    .watch(['index.node', '{src,js-src}/**.{js,ts,rs}'])
    .on('change', (path) => {
      if (/\.rs$/i.test(path)) {
        console.log(chalk.dim('🦀 Rebuilding Rust...'));
        rebuildRust();
      } else {
        console.log(chalk.dim('📃 Rebuilding TypeScript...'));
        rebuildTypeScript();
      }
    });
}

main();
