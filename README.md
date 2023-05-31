# c2pa-node

**c2pa-node:** Node.js bindings for C2PA

## Installing c2pa-node

Installing c2pa-node requires a [supported version of Node and Rust](https://github.com/neon-bindings/neon#platform-support). 
[nvm](https://github.com/nvm-sh/nvm) is a good tool for managing multiple versions of Node on your machine, and you can install
Rust by [visiting this link](https://www.rust-lang.org/tools/install).

You can install the project with npm. In the project directory, run:

```sh
# Switch to the supported version of Node.js for building
$ nvm use
# Install dependencies
$ npm install
# Build the SDK
$ npm run build
```

## Testing

After installation, you can run the test suite by running:

```sh
$ npm test
```