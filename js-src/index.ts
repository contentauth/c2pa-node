import bindings from './bindings';

function main() {
  console.log('Running main()');
  const output = bindings.hello();
  console.log('output', output);
}

main();
