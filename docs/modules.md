[c2pa-node](README.md) / Exports

# c2pa-node

## Table of contents

### Namespaces

- [types](modules/types.md)

### Enumerations

- [SigningAlgorithm](enums/SigningAlgorithm.md)

### Classes

- [ManifestBuilder](classes/ManifestBuilder.md)

### Interfaces

- [Asset](interfaces/Asset.md)
- [CreateIngredientProps](interfaces/CreateIngredientProps.md)
- [LocalSigner](interfaces/LocalSigner.md)
- [RemoteSigner](interfaces/RemoteSigner.md)
- [ResolvedIngredient](interfaces/ResolvedIngredient.md)
- [ResolvedManifest](interfaces/ResolvedManifest.md)
- [ResolvedManifestStore](interfaces/ResolvedManifestStore.md)
- [ResolvedResource](interfaces/ResolvedResource.md)
- [ResolvedSignatureInfo](interfaces/ResolvedSignatureInfo.md)
- [SignClaimBytesProps](interfaces/SignClaimBytesProps.md)
- [SignInput](interfaces/SignInput.md)
- [SignOptions](interfaces/SignOptions.md)
- [SignOutput](interfaces/SignOutput.md)
- [SignProps](interfaces/SignProps.md)
- [StorableIngredient](interfaces/StorableIngredient.md)
- [ThumbnailOptions](interfaces/ThumbnailOptions.md)

### Type Aliases

- [C2pa](modules.md#c2pa)
- [C2paOptions](modules.md#c2paoptions)
- [HashAlgorithm](modules.md#hashalgorithm)
- [IngredientResourceStore](modules.md#ingredientresourcestore)
- [Signer](modules.md#signer)

### Functions

- [createC2pa](modules.md#createc2pa)
- [createTestSigner](modules.md#createtestsigner)

## Type Aliases

### C2pa

Ƭ **C2pa**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `createIngredient` | `ReturnType`<typeof `createIngredientFunction`\> |
| `read` | typeof `read` |
| `sign` | `ReturnType`<typeof `createSign`\> |
| `signClaimBytes` | typeof `signClaimBytes` |

#### Defined in

[index.ts:24](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/index.ts#L24)

___

### C2paOptions

Ƭ **C2paOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ingredientHashAlgorithm?` | [`HashAlgorithm`](modules.md#hashalgorithm) |
| `signer?` | [`Signer`](modules.md#signer) |
| `thumbnail?` | [`ThumbnailOptions`](interfaces/ThumbnailOptions.md) \| ``false`` \| ``null`` |

#### Defined in

[index.ts:14](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/index.ts#L14)

___

### HashAlgorithm

Ƭ **HashAlgorithm**: ``"sha256"`` \| ``"sha384"`` \| ``"sha512"``

#### Defined in

[lib/hash.ts:5](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/hash.ts#L5)

___

### IngredientResourceStore

Ƭ **IngredientResourceStore**: `Record`<`string`, `Buffer`\>

#### Defined in

[bindings.ts:281](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/bindings.ts#L281)

___

### Signer

Ƭ **Signer**: [`LocalSigner`](interfaces/LocalSigner.md) \| [`RemoteSigner`](interfaces/RemoteSigner.md)

#### Defined in

[lib/signer.ts:39](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/signer.ts#L39)

## Functions

### createC2pa

▸ **createC2pa**(`options?`): [`C2pa`](modules.md#c2pa)

Creates an instance of the SDK that encompasses a set of global options

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`C2paOptions`](modules.md#c2paoptions) | Global options for the C2PA instance |

#### Returns

[`C2pa`](modules.md#c2pa)

#### Defined in

[index.ts:36](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/index.ts#L36)

___

### createTestSigner

▸ **createTestSigner**(): `Promise`<[`Signer`](modules.md#signer)\>

#### Returns

`Promise`<[`Signer`](modules.md#signer)\>

#### Defined in

[lib/signer.ts:41](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/signer.ts#L41)
