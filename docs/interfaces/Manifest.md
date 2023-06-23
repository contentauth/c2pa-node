[c2pa-node](../README.md) / [Exports](../modules.md) / Manifest

# Interface: Manifest

A Manifest represents all the information in a c2pa manifest

## Indexable

▪ [property: `string`]: `any`

## Table of contents

### Properties

- [assertions](Manifest.md#assertions)
- [claim\_generator](Manifest.md#claim_generator)
- [claim\_generator\_hints](Manifest.md#claim_generator_hints)
- [credentials](Manifest.md#credentials)
- [format](Manifest.md#format)
- [ingredients](Manifest.md#ingredients)
- [instance\_id](Manifest.md#instance_id)
- [label](Manifest.md#label)
- [redactions](Manifest.md#redactions)
- [resources](Manifest.md#resources)
- [signature\_info](Manifest.md#signature_info)
- [thumbnail](Manifest.md#thumbnail)
- [title](Manifest.md#title)
- [vendor](Manifest.md#vendor)

## Properties

### assertions

• `Optional` **assertions**: `ManifestAssertion`[]

A list of assertions

#### Defined in

[types.d.ts:27](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L27)

___

### claim\_generator

• `Optional` **claim\_generator**: `string`

A User Agent formatted string identifying the software/hardware/system produced this
claim Spaces are not allowed in names, versions can be specified with product/1.0 syntax

#### Defined in

[types.d.ts:32](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L32)

___

### claim\_generator\_hints

• `Optional` **claim\_generator\_hints**: ``null`` \| { `[key: string]`: `any`;  }

#### Defined in

[types.d.ts:33](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L33)

___

### credentials

• `Optional` **credentials**: ``null`` \| `any`[]

A List of verified credentials

#### Defined in

[types.d.ts:37](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L37)

___

### format

• `Optional` **format**: `string`

The format of the source file as a MIME type.

#### Defined in

[types.d.ts:41](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L41)

___

### ingredients

• `Optional` **ingredients**: [`Ingredient`](Ingredient.md)[]

A List of ingredients

#### Defined in

[types.d.ts:45](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L45)

___

### instance\_id

• `Optional` **instance\_id**: `string`

Instance ID from `xmpMM:InstanceID` in XMP metadata.

#### Defined in

[types.d.ts:49](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L49)

___

### label

• `Optional` **label**: ``null`` \| `string`

#### Defined in

[types.d.ts:50](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L50)

___

### redactions

• `Optional` **redactions**: ``null`` \| `string`[]

A list of redactions - URIs to a redacted assertions

#### Defined in

[types.d.ts:54](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L54)

___

### resources

• `Optional` **resources**: `ResourceStore`

container for binary assets (like thumbnails)

#### Defined in

[types.d.ts:58](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L58)

___

### signature\_info

• `Optional` **signature\_info**: ``null`` \| `SignatureInfo`

Signature data (only used for reporting)

#### Defined in

[types.d.ts:62](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L62)

___

### thumbnail

• `Optional` **thumbnail**: ``null`` \| `ResourceRef`

#### Defined in

[types.d.ts:63](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L63)

___

### title

• `Optional` **title**: ``null`` \| `string`

A human-readable title, generally source filename.

#### Defined in

[types.d.ts:67](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L67)

___

### vendor

• `Optional` **vendor**: ``null`` \| `string`

Optional prefix added to the generated Manifest Label This is typically Internet domain
name for the vendor (i.e. `adobe`)

#### Defined in

[types.d.ts:72](https://github.com/contentauth/c2pa-node/blob/7225e97/js-src/types.d.ts#L72)
