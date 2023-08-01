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

[types.d.ts:92](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L92)

___

### instance

• `Optional` **instance**: ``null`` \| `number`

There can be more than one assertion for any label

#### Defined in

[types.d.ts:96](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L96)

___

### kind

• `Optional` **kind**: ``null`` \| [`ManifestAssertionKind`](../enums/types.ManifestAssertionKind.md)

The [ManifestAssertionKind] for this assertion (as stored in c2pa content)

#### Defined in

[types.d.ts:100](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L100)

___

### label

• **label**: `string`

An assertion label in reverse domain format

#### Defined in

[types.d.ts:104](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L104)
