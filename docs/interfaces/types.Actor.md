[c2pa-node](../README.md) / [Exports](../modules.md) / [types](../modules/types.md) / Actor

# Interface: Actor

[types](../modules/types.md).Actor

Identifies a person responsible for an action.

## Indexable

▪ [property: `string`]: `any`

## Table of contents

### Properties

- [credentials](types.Actor.md#credentials)
- [identifier](types.Actor.md#identifier)

## Properties

### credentials

• `Optional` **credentials**: ``null`` \| [`HashedURI`](types.HashedURI.md)[]

List of references to W3C Verifiable Credentials.

#### Defined in

[types.d.ts:234](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L234)

___

### identifier

• `Optional` **identifier**: ``null`` \| `string`

An identifier for a human actor, used when the "type" is `humanEntry.identified`.

#### Defined in

[types.d.ts:238](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L238)
