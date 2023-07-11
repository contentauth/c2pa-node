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
- [StorableIngredient](interfaces/StorableIngredient.md)
- [ThumbnailOptions](interfaces/ThumbnailOptions.md)

### Type Aliases

- [BufferSignProps](modules.md#buffersignprops)
- [C2pa](modules.md#c2pa)
- [C2paOptions](modules.md#c2paoptions)
- [FileSignProps](modules.md#filesignprops)
- [HashAlgorithm](modules.md#hashalgorithm)
- [IngredientResourceStore](modules.md#ingredientresourcestore)
- [SignProps](modules.md#signprops)
- [Signer](modules.md#signer)

### Functions

- [createC2pa](modules.md#createc2pa)
- [createTestSigner](modules.md#createtestsigner)

## Type Aliases

### BufferSignProps

Ƭ **BufferSignProps**: `BaseSignProps` & { `asset`: [`Asset`](interfaces/Asset.md) ; `sourceType`: ``"memory"``  }

#### Defined in

[bindings.ts:203](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/bindings.ts#L203)

___

### C2pa

Ƭ **C2pa**: `ReturnType`<typeof `createSign`\> & { `createIngredient`: `ReturnType`<typeof `createIngredientFunction`\> ; `read`: typeof `read`  }

#### Defined in

[index.ts:28](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/index.ts#L28)

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

[index.ts:18](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/index.ts#L18)

___

### FileSignProps

Ƭ **FileSignProps**: `BaseSignProps` & { `inputPath`: `string` ; `outputPath`: `string` ; `sourceType`: ``"file"``  }

#### Defined in

[bindings.ts:209](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/bindings.ts#L209)

___

### HashAlgorithm

Ƭ **HashAlgorithm**: ``"sha256"`` \| ``"sha384"`` \| ``"sha512"``

#### Defined in

[lib/hash.ts:17](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/lib/hash.ts#L17)

___

### IngredientResourceStore

Ƭ **IngredientResourceStore**: `Record`<`string`, `Buffer`\>

#### Defined in

[bindings.ts:345](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/bindings.ts#L345)

___

### SignProps

Ƭ **SignProps**: [`BufferSignProps`](modules.md#buffersignprops) \| [`FileSignProps`](modules.md#filesignprops)

#### Defined in

[bindings.ts:215](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/bindings.ts#L215)

___

### Signer

Ƭ **Signer**: [`LocalSigner`](interfaces/LocalSigner.md) \| [`RemoteSigner`](interfaces/RemoteSigner.md)

#### Defined in

[lib/signer.ts:48](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/lib/signer.ts#L48)

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

[index.ts:38](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/index.ts#L38)

___

### createTestSigner

▸ **createTestSigner**(): `Promise`<[`Signer`](modules.md#signer)\>

#### Returns

`Promise`<[`Signer`](modules.md#signer)\>

#### Defined in

[lib/signer.ts:50](https://github.com/contentauth/c2pa-node/blob/c147a66/js-src/lib/signer.ts#L50)
