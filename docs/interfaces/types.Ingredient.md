[c2pa-node](../README.md) / [Exports](../modules.md) / [types](../modules/types.md) / Ingredient

# Interface: Ingredient

[types](../modules/types.md).Ingredient

An `Ingredient` is any external asset that has been used in the creation of an image.

## Indexable

▪ [property: `string`]: `any`

## Table of contents

### Properties

- [active\_manifest](types.Ingredient.md#active_manifest)
- [document\_id](types.Ingredient.md#document_id)
- [format](types.Ingredient.md#format)
- [hash](types.Ingredient.md#hash)
- [instance\_id](types.Ingredient.md#instance_id)
- [manifest\_data](types.Ingredient.md#manifest_data)
- [metadata](types.Ingredient.md#metadata)
- [provenance](types.Ingredient.md#provenance)
- [relationship](types.Ingredient.md#relationship)
- [resources](types.Ingredient.md#resources)
- [thumbnail](types.Ingredient.md#thumbnail)
- [title](types.Ingredient.md#title)
- [validation\_status](types.Ingredient.md#validation_status)

## Properties

### active\_manifest

• `Optional` **active\_manifest**: ``null`` \| `string`

The active manifest label (if one exists).

If this ingredient has a [`ManifestStore`], this will hold the label of the active
[`Manifest`].

[`Manifest`]: crate::Manifest [`ManifestStore`]: crate::ManifestStore

#### Defined in

[types.d.ts:130](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L130)

___

### document\_id

• `Optional` **document\_id**: ``null`` \| `string`

Document ID from `xmpMM:DocumentID` in XMP metadata.

#### Defined in

[types.d.ts:134](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L134)

___

### format

• `Optional` **format**: `string`

The format of the source file as a MIME type.

#### Defined in

[types.d.ts:138](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L138)

___

### hash

• `Optional` **hash**: ``null`` \| `string`

An optional hash of the asset to prevent duplicates.

#### Defined in

[types.d.ts:142](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L142)

___

### instance\_id

• `Optional` **instance\_id**: `string`

Instance ID from `xmpMM:InstanceID` in XMP metadata.

#### Defined in

[types.d.ts:146](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L146)

___

### manifest\_data

• `Optional` **manifest\_data**: ``null`` \| [`ResourceRef`](types.ResourceRef.md)

A [`ManifestStore`] from the source asset extracted as a binary C2PA blob.

[`ManifestStore`]: crate::ManifestStore

#### Defined in

[types.d.ts:152](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L152)

___

### metadata

• `Optional` **metadata**: ``null`` \| [`Metadata`](types.Metadata.md)

Any additional [`Metadata`] as defined in the C2PA spec.

[`Manifest`]: crate::Manifest

#### Defined in

[types.d.ts:158](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L158)

___

### provenance

• `Optional` **provenance**: ``null`` \| `string`

URI from `dcterms:provenance` in XMP metadata.

#### Defined in

[types.d.ts:162](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L162)

___

### relationship

• `Optional` **relationship**: [`Relationship`](../enums/types.Relationship.md)

Set to `ParentOf` if this is the parent ingredient.

There can only be one parent ingredient in the ingredients.

#### Defined in

[types.d.ts:168](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L168)

___

### resources

• `Optional` **resources**: [`ResourceStore`](types.ResourceStore.md)

#### Defined in

[types.d.ts:169](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L169)

___

### thumbnail

• `Optional` **thumbnail**: ``null`` \| [`ResourceRef`](types.ResourceRef.md)

A thumbnail image capturing the visual state at the time of import.

A tuple of thumbnail MIME format (i.e. `image/jpeg`) and binary bits of the image.

#### Defined in

[types.d.ts:175](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L175)

___

### title

• **title**: `string`

A human-readable title, generally source filename.

#### Defined in

[types.d.ts:179](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L179)

___

### validation\_status

• `Optional` **validation\_status**: ``null`` \| [`ValidationStatus`](types.ValidationStatus.md)[]

Validation results.

#### Defined in

[types.d.ts:183](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L183)
