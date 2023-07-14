# c2pa-node

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
