[c2pa-node](../README.md) / [Exports](../modules.md) / [types](../modules/types.md) / ManifestAssertion

# Interface: ManifestAssertion

[types](../modules/types.md).ManifestAssertion

A labeled container for an Assertion value in a Manifest

## Indexable

▪ [property: `string`]: `any`

## Table of contents

### Properties

- [data](types.ManifestAssertion.md#data)
- [instance](types.ManifestAssertion.md#instance)
- [kind](types.ManifestAssertion.md#kind)
- [label](types.ManifestAssertion.md#label)

## Properties

### data

• **data**: `any`

The data of the assertion as Value

#### Defined in

[types.d.ts:83](https://github.com/contentauth/c2pa-node/blob/46975b6/js-src/types.d.ts#L83)

___

### instance

• `Optional` **instance**: ``null`` \| `number`

There can be more than one assertion for any label

#### Defined in

[types.d.ts:87](https://github.com/contentauth/c2pa-node/blob/46975b6/js-src/types.d.ts#L87)

___

### kind

• `Optional` **kind**: ``null`` \| [`ManifestAssertionKind`](../enums/types.ManifestAssertionKind.md)

The [ManifestAssertionKind] for this assertion (as stored in c2pa content)

#### Defined in

[types.d.ts:91](https://github.com/contentauth/c2pa-node/blob/46975b6/js-src/types.d.ts#L91)

___

### label

• **label**: `string`

An assertion label in reverse domain format

#### Defined in

[types.d.ts:95](https://github.com/contentauth/c2pa-node/blob/46975b6/js-src/types.d.ts#L95)
