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
| `baseDefinition` | [`BaseManifestDefinition`](../modules.md#basemanifestdefinition) |
| `options?` | `ManifestBuilderOptions` |

#### Defined in

[lib/manifestBuilder.ts:41](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L41)

## Properties

### #definition

• `Private` **#definition**: `ManifestDefinition`

#### Defined in

[lib/manifestBuilder.ts:35](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L35)

___

### #ingredients

• `Private` **#ingredients**: `Record`<`string`, [`StorableIngredient`](../interfaces/StorableIngredient.md)\> = `{}`

#### Defined in

[lib/manifestBuilder.ts:39](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L39)

___

### #resourceStore

• `Private` **#resourceStore**: `Record`<`string`, `Buffer`\> = `{}`

#### Defined in

[lib/manifestBuilder.ts:37](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L37)

___

### requiredFields

▪ `Static` **requiredFields**: `string`[]

#### Defined in

[lib/manifestBuilder.ts:33](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L33)

## Accessors

### definition

• `get` **definition**(): `ManifestDefinition`

#### Returns

`ManifestDefinition`

#### Defined in

[lib/manifestBuilder.ts:105](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L105)

___

### sendableIngredients

• `get` **sendableIngredients**(): { `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[]

#### Returns

{ `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[]

#### Defined in

[lib/manifestBuilder.ts:109](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L109)

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

[lib/manifestBuilder.ts:72](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L72)

___

### addThumbnail

▸ **addThumbnail**(`thumbnail`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `thumbnail` | [`BufferAsset`](../interfaces/BufferAsset.md) |

#### Returns

`Promise`<`void`\>

#### Defined in

[lib/manifestBuilder.ts:86](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L86)

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

[lib/manifestBuilder.ts:118](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L118)

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

[lib/manifestBuilder.ts:95](https://github.com/contentauth/c2pa-node/blob/fb1d732/js-src/lib/manifestBuilder.ts#L95)
