[c2pa-node](../README.md) / [Exports](../modules.md) / [types](../modules/types.md) / ManifestStore

# Interface: ManifestStore

[types](../modules/types.md).ManifestStore

A Container for a set of Manifests and a ValidationStatus list

## Indexable

▪ [property: `string`]: `any`

## Table of contents

### Properties

- [active\_manifest](types.ManifestStore.md#active_manifest)
- [manifests](types.ManifestStore.md#manifests)
- [validation\_status](types.ManifestStore.md#validation_status)

## Properties

### active\_manifest

• `Optional` **active\_manifest**: ``null`` \| `string`

A label for the active (most recent) manifest in the store

#### Defined in

[types.d.ts:8](https://github.com/contentauth/c2pa-node/blob/46975b6/js-src/types.d.ts#L8)

___

### manifests

• **manifests**: `Object`

A HashMap of Manifests

#### Index signature

▪ [key: `string`]: [`Manifest`](types.Manifest.md)

#### Defined in

[types.d.ts:12](https://github.com/contentauth/c2pa-node/blob/46975b6/js-src/types.d.ts#L12)

___

### validation\_status

• `Optional` **validation\_status**: ``null`` \| [`ValidationStatus`](types.ValidationStatus.md)[]

ValidationStatus generated when loading the ManifestStore from an asset

#### Defined in

[types.d.ts:16](https://github.com/contentauth/c2pa-node/blob/46975b6/js-src/types.d.ts#L16)
