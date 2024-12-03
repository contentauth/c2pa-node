# Contributing to the project

The information in this page is primarily for those who wish to contribute to the c2pa-python library project itself, rather than those who simply wish to use it in an application.  For general contribution guidelines, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Building

If you want to contribute to this project, install the project with pnpm. In the project directory, enter these commands:

```sh
# Switch to the supported version of Node.js for building
$ nvm use
# Install pnpm
$ npm install -g pnpm
# Install dependencies
$ pnpm install
# Build the SDK
$ pnpm run build
```

### Testing

After installation, run the test suite by entering this command:

```sh
$ pnpm test
```

In case the tests don't run, you may need to run a build first:

```sh
$ pnpm build
```
