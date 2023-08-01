[c2pa-node](../README.md) / [Exports](../modules.md) / [types](../modules/types.md) / Manifest

# Interface: Manifest

[types](../modules/types.md).Manifest

A Manifest represents all the information in a c2pa manifest

## Indexable

▪ [property: `string`]: `any`

## Table of contents

### Properties

- [assertions](types.Manifest.md#assertions)
- [claim\_generator](types.Manifest.md#claim_generator)
- [claim\_generator\_hints](types.Manifest.md#claim_generator_hints)
- [credentials](types.Manifest.md#credentials)
- [format](types.Manifest.md#format)
- [ingredients](types.Manifest.md#ingredients)
- [instance\_id](types.Manifest.md#instance_id)
- [label](types.Manifest.md#label)
- [redactions](types.Manifest.md#redactions)
- [resources](types.Manifest.md#resources)
- [signature\_info](types.Manifest.md#signature_info)
- [thumbnail](types.Manifest.md#thumbnail)
- [title](types.Manifest.md#title)
- [vendor](types.Manifest.md#vendor)

## Properties

### assertions

• `Optional` **assertions**: [`ManifestAssertion`](types.ManifestAssertion.md)[]

A list of assertions

#### Defined in

[types.d.ts:36](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L36)

___

### claim\_generator

• `Optional` **claim\_generator**: `string`

A User Agent formatted string identifying the software/hardware/system produced this
claim Spaces are not allowed in names, versions can be specified with product/1.0 syntax

#### Defined in

[types.d.ts:41](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L41)

___

### claim\_generator\_hints

• `Optional` **claim\_generator\_hints**: ``null`` \| { `[key: string]`: `any`;  }

#### Defined in

[types.d.ts:42](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L42)

___

### credentials

• `Optional` **credentials**: ``null`` \| `any`[]

A List of verified credentials

#### Defined in

[types.d.ts:46](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L46)

___

### format

• `Optional` **format**: `string`

The format of the source file as a MIME type.

#### Defined in

[types.d.ts:50](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L50)

___

### ingredients

• `Optional` **ingredients**: [`Ingredient`](types.Ingredient.md)[]

A List of ingredients

#### Defined in

[types.d.ts:54](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L54)

___

### instance\_id

• `Optional` **instance\_id**: `string`

Instance ID from `xmpMM:InstanceID` in XMP metadata.

#### Defined in

[types.d.ts:58](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L58)

___

### label

• `Optional` **label**: ``null`` \| `string`

#### Defined in

[types.d.ts:59](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L59)

___

### redactions

• `Optional` **redactions**: ``null`` \| `string`[]

A list of redactions - URIs to a redacted assertions

#### Defined in

[types.d.ts:63](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L63)

___

### resources

• `Optional` **resources**: [`ResourceStore`](types.ResourceStore.md)

container for binary assets (like thumbnails)

#### Defined in

[types.d.ts:67](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L67)

___

### signature\_info

• `Optional` **signature\_info**: ``null`` \| [`SignatureInfo`](types.SignatureInfo.md)

Signature data (only used for reporting)

#### Defined in

[types.d.ts:71](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L71)

___

### thumbnail

• `Optional` **thumbnail**: ``null`` \| [`ResourceRef`](types.ResourceRef.md)

#### Defined in

[types.d.ts:72](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L72)

___

### title

• `Optional` **title**: ``null`` \| `string`

A human-readable title, generally source filename.

#### Defined in

[types.d.ts:76](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L76)

___

### vendor

• `Optional` **vendor**: ``null`` \| `string`

Optional prefix added to the generated Manifest Label This is typically Internet domain
name for the vendor (i.e. `adobe`)

#### Defined in

[types.d.ts:81](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/types.d.ts#L81)
