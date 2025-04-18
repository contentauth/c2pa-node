# c2pa-node

## 0.5.25

### Patch Changes

- 8d680dd: Lower glibc requirement

## 0.5.24

### Patch Changes

- e26e035: Support reading v2 claims

## 0.5.23

### Patch Changes

- ac902ff: Bubble up errors from Rust

## 0.5.22

### Patch Changes

- ae9d2ba: Set min engine version to Node 16.13.0

## 0.5.21

### Patch Changes

- 03d2616: Update to latest c2pa-rs version

## 0.5.20

### Patch Changes

- c64c520: Update Rust dependencies (c2pa-rs v0.31.2)

## 0.5.19

### Patch Changes

- 5b4f3fd: Add macOS build support

## 0.5.18

### Patch Changes

- 0decbdc: Update archive filename

## 0.5.17

### Patch Changes

- 638d6ff: Move packages out of devDependencies to fix postinstall

## 0.5.16

### Patch Changes

- 3ec22a2: Fix release action

## 0.5.15

### Patch Changes

- 66d27a0: Update publish workflow since release trigger wasn't getting called

## 0.5.14

### Patch Changes

- 6031ec7: Update release trigger

## 0.5.13

### Patch Changes

- 8526410: - Add precompiled binary support for Linux, macOS, and Windows
  - Update c2pa-rs to 0.27.1

## 0.5.12

### Patch Changes

- 4c77546: fixes issue where we leave unsettled promises in the rust layer, which caused unhandled promise rejections in the js layer

## 0.5.11

### Patch Changes

- 38a239d: updates neon dependency from feature branch to commit hash

## 0.5.10

### Patch Changes

- 6b6dbe3: handles RemoteSigner function exceptions gracefully

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
