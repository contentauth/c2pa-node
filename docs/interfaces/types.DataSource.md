[c2pa-node](../README.md) / [Exports](../modules.md) / [types](../modules/types.md) / DataSource

# Interface: DataSource

[types](../modules/types.md).DataSource

A description of the source for assertion data

## Indexable

▪ [property: `string`]: `any`

## Table of contents

### Properties

- [actors](types.DataSource.md#actors)
- [details](types.DataSource.md#details)
- [type](types.DataSource.md#type)

## Properties

### actors

• `Optional` **actors**: ``null`` \| [`Actor`](types.Actor.md)[]

A list of [`Actor`]s associated with this source.

#### Defined in

[types.d.ts:215](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L215)

___

### details

• `Optional` **details**: ``null`` \| `string`

A human-readable string giving details about the source of the assertion data.

#### Defined in

[types.d.ts:219](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L219)

___

### type

• **type**: `string`

A value from among the enumerated list indicating the source of the assertion.

#### Defined in

[types.d.ts:223](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L223)
