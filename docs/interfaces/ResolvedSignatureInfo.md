[c2pa-node](../README.md) / [Exports](../modules.md) / ResolvedSignatureInfo

# Interface: ResolvedSignatureInfo

Holds information about a signature

## Hierarchy

- [`SignatureInfo`](types.SignatureInfo.md)

  ↳ **`ResolvedSignatureInfo`**

## Table of contents

### Properties

- [issuer](ResolvedSignatureInfo.md#issuer)
- [time](ResolvedSignatureInfo.md#time)
- [timeObject](ResolvedSignatureInfo.md#timeobject)

## Properties

### issuer

• `Optional` **issuer**: ``null`` \| `string`

human readable issuing authority for this signature

#### Inherited from

[SignatureInfo](types.SignatureInfo.md).[issuer](types.SignatureInfo.md#issuer)

#### Defined in

[types.d.ts:308](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L308)

___

### time

• `Optional` **time**: ``null`` \| `string`

the time the signature was created

#### Inherited from

[SignatureInfo](types.SignatureInfo.md).[time](types.SignatureInfo.md#time)

#### Defined in

[types.d.ts:312](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L312)

___

### timeObject

• `Optional` **timeObject**: ``null`` \| `Date`

#### Defined in

[bindings.ts:47](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/bindings.ts#L47)
