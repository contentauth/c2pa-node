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

- [BufferAsset](interfaces/BufferAsset.md)
- [CreateIngredientProps](interfaces/CreateIngredientProps.md)
- [FileAsset](interfaces/FileAsset.md)
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
- [StorableIngredient](interfaces/StorableIngredient.md)
- [ThumbnailOptions](interfaces/ThumbnailOptions.md)

### Type Aliases

- [Asset](modules.md#asset)
- [BaseManifestDefinition](modules.md#basemanifestdefinition)
- [C2pa](modules.md#c2pa)
- [C2paOptions](modules.md#c2paoptions)
- [HashAlgorithm](modules.md#hashalgorithm)
- [IngredientResourceStore](modules.md#ingredientresourcestore)
- [SignOutput](modules.md#signoutput)
- [SignProps](modules.md#signprops)
- [Signer](modules.md#signer)

### Functions

- [createC2pa](modules.md#createc2pa)
- [createTestSigner](modules.md#createtestsigner)

## Type Aliases

### Asset

Ƭ **Asset**: [`BufferAsset`](interfaces/BufferAsset.md) \| [`FileAsset`](interfaces/FileAsset.md)

An asset that can either be in memory or on disk

#### Defined in

[bindings.ts:154](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/bindings.ts#L154)

___

### BaseManifestDefinition

Ƭ **BaseManifestDefinition**: `Omit`<`ManifestDefinition`, ``"thumbnail"`` \| ``"ingredients"``\> & `RequiredFields`

#### Defined in

[lib/manifestBuilder.ts:21](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L21)

___

### C2pa

Ƭ **C2pa**: `ReturnType`<typeof `createSign`\> & { `createIngredient`: `ReturnType`<typeof `createIngredientFunction`\> ; `read`: typeof `read`  }

#### Defined in

[index.ts:28](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/index.ts#L28)

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

[index.ts:18](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/index.ts#L18)

___

### HashAlgorithm

Ƭ **HashAlgorithm**: ``"sha256"`` \| ``"sha384"`` \| ``"sha512"``

#### Defined in

[lib/hash.ts:17](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/hash.ts#L17)

___

### IngredientResourceStore

Ƭ **IngredientResourceStore**: `Record`<`string`, `Buffer`\>

#### Defined in

[bindings.ts:353](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/bindings.ts#L353)

___

### SignOutput

Ƭ **SignOutput**<`AssetType`\>: `AssetType` extends [`BufferAsset`](interfaces/BufferAsset.md) ? `SignOutputData`<[`BufferAsset`](interfaces/BufferAsset.md)\> : `AssetType` extends [`FileAsset`](interfaces/FileAsset.md) ? `SignOutputData`<[`FileAsset`](interfaces/FileAsset.md)\> : `never`

#### Type parameters

| Name |
| :------ |
| `AssetType` |

#### Defined in

[bindings.ts:225](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/bindings.ts#L225)

___

### SignProps

Ƭ **SignProps**<`AssetType`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `AssetType` | extends [`Asset`](modules.md#asset) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `asset` | `AssetType` |
| `manifest` | [`ManifestBuilder`](classes/ManifestBuilder.md) |
| `options?` | [`SignOptions`](interfaces/SignOptions.md) |
| `signer?` | [`Signer`](modules.md#signer) |
| `thumbnail?` | [`BufferAsset`](interfaces/BufferAsset.md) \| ``false`` |

#### Defined in

[bindings.ts:201](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/bindings.ts#L201)

___

### Signer

Ƭ **Signer**: [`LocalSigner`](interfaces/LocalSigner.md) \| [`RemoteSigner`](interfaces/RemoteSigner.md)

#### Defined in

[lib/signer.ts:50](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/signer.ts#L50)

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

[index.ts:38](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/index.ts#L38)

___

### createTestSigner

▸ **createTestSigner**(`«destructured»?`): `Promise`<[`LocalSigner`](interfaces/LocalSigner.md)\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `«destructured»` | `TestSignerOptions` | `defaultTestSignerOptions` |

#### Returns

`Promise`<[`LocalSigner`](interfaces/LocalSigner.md)\>

#### Defined in

[lib/signer.ts:64](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/signer.ts#L64)
