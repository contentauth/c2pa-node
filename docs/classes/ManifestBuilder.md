[c2pa-node](../README.md) / [Exports](../modules.md) / ManifestBuilder

# Class: ManifestBuilder

## Table of contents

### Constructors

- [constructor](ManifestBuilder.md#constructor)

### Properties

- [#definition](ManifestBuilder.md##definition)
- [#ingredients](ManifestBuilder.md##ingredients)
- [#resourceStore](ManifestBuilder.md##resourcestore)
- [requiredFields](ManifestBuilder.md#requiredfields)

### Accessors

- [definition](ManifestBuilder.md#definition)
- [sendableIngredients](ManifestBuilder.md#sendableingredients)
- [generator](ManifestBuilder.md#generator)

### Methods

- [addIngredient](ManifestBuilder.md#addingredient)
- [addThumbnail](ManifestBuilder.md#addthumbnail)
- [asSendable](ManifestBuilder.md#assendable)
- [createLabel](ManifestBuilder.md#createlabel)

## Constructors

### constructor

• **new ManifestBuilder**(`baseDefinition`, `options?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `baseDefinition` | `BaseManifestDefinition` |
| `options?` | `ManifestBuilderOptions` |

#### Defined in

[lib/manifestBuilder.ts:46](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L46)

## Properties

### #definition

• `Private` **#definition**: `ManifestDefinition`

#### Defined in

[lib/manifestBuilder.ts:36](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L36)

___

### #ingredients

• `Private` **#ingredients**: `Record`<`string`, [`StorableIngredient`](../interfaces/StorableIngredient.md)\> = `{}`

#### Defined in

[lib/manifestBuilder.ts:40](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L40)

___

### #resourceStore

• `Private` **#resourceStore**: `Record`<`string`, `Buffer`\> = `{}`

#### Defined in

[lib/manifestBuilder.ts:38](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L38)

___

### requiredFields

▪ `Static` **requiredFields**: `string`[]

#### Defined in

[lib/manifestBuilder.ts:34](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L34)

## Accessors

### definition

• `get` **definition**(): `ManifestDefinition`

#### Returns

`ManifestDefinition`

#### Defined in

[lib/manifestBuilder.ts:108](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L108)

___

### sendableIngredients

• `get` **sendableIngredients**(): { `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[]

#### Returns

{ `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[]

#### Defined in

[lib/manifestBuilder.ts:112](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L112)

___

### generator

• `Static` `get` **generator**(): `string`

#### Returns

`string`

#### Defined in

[lib/manifestBuilder.ts:42](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L42)

## Methods

### addIngredient

▸ **addIngredient**(`input`): [`ManifestBuilder`](ManifestBuilder.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`StorableIngredient`](../interfaces/StorableIngredient.md) |

#### Returns

[`ManifestBuilder`](ManifestBuilder.md)

#### Defined in

[lib/manifestBuilder.ts:75](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L75)

___

### addThumbnail

▸ **addThumbnail**(`thumbnail`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `thumbnail` | [`Asset`](../interfaces/Asset.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/manifestBuilder.ts:89](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L89)

___

### asSendable

▸ **asSendable**(): `Object`

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `ingredients` | { `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[] |
| `manifest` | `string` |
| `resourceStore` | `Record`<`string`, `Buffer`\> |

#### Defined in

[lib/manifestBuilder.ts:121](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L121)

___

### createLabel

▸ `Static` **createLabel**(`vendor?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `vendor?` | `string` |

#### Returns

`string`

#### Defined in

[lib/manifestBuilder.ts:98](https://github.com/contentauth/c2pa-node/blob/de93f0b/js-src/lib/manifestBuilder.ts#L98)
