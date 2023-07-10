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

[types.d.ts:225](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/types.d.ts#L225)

___

### identifier

• `Optional` **identifier**: ``null`` \| `string`

An identifier for a human actor, used when the "type" is `humanEntry.identified`.

#### Defined in

[types.d.ts:229](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/types.d.ts#L229)
