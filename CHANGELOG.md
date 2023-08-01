# c2pa-node

## 0.5.9

### Patch Changes

- 5be4e7e: Move `chalk` to prod dependencies, update `semver`

## 0.5.8

### Patch Changes

- a767ef5: Skip building Rust if Rust toolchain is not found

## 0.5.7

### Patch Changes

- 3ab537f: Fix bug when loading test certs

## 0.5.6

### Patch Changes

- cfcef58: Fixed postinstall bug

## 0.5.5

### Patch Changes

- 6270742: Update types
  Download cert files for test signer automatically on postinstall

## 0.5.4

### Patch Changes

- 029c03e: Add pkg-dir as a regular dependency for the postinstall script

## 0.5.3

### Patch Changes

- 85d57f2: Don't check for presence of `C2PA_LIBRARY_PATH` on `postinstall`

## 0.5.2

### Patch Changes

- aa9d977: Update c2pa-rs to 0.25.1 and add support for `C2PA_LIBRARY_PATH`

## 0.5.1

### Patch Changes

- 558c9a1: Update c2pa-rs to 0.25.0, add ability to provide an ingredient hash

## 0.5.0

### Minor Changes

- bc880c5: Updated APIs to take a standard `asset` object as input that can represent both buffer and file assets

## 0.4.0

### Minor Changes

- e5efaaf: Update signing functions (`sign` is now `signBuffer` and `signFile`), fix packaging

## 0.3.1

### Patch Changes

- 43b427c: Build the bindings file locally instead of publishing

## 0.3.0

### Minor Changes

- 0f54493: Add file support for adding ingredients and signing

### Patch Changes

- 8f4a321: Added C2PA types to exports

## 0.2.1

### Patch Changes

- f9c21f4: Add ability to specify a custom signer during the `sign` call

## 0.2.0

### Minor Changes

- 8531f09: Add `sign`, `addIngredient`, `signClaimBytes` and `ManifestBuilder` APIs
