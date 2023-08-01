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

[types.d.ts:17](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L17)

___

### manifests

• **manifests**: `Object`

A HashMap of Manifests

#### Index signature

▪ [key: `string`]: [`Manifest`](types.Manifest.md)

#### Defined in

[types.d.ts:21](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L21)

___

### validation\_status

• `Optional` **validation\_status**: ``null`` \| [`ValidationStatus`](types.ValidationStatus.md)[]

ValidationStatus generated when loading the ManifestStore from an asset

#### Defined in

[types.d.ts:25](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L25)
