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
| `baseDefinition` | `BaseManifestDefinition` |
| `options?` | `ManifestBuilderOptions` |

#### Defined in

[lib/manifestBuilder.ts:41](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L41)

## Properties

### #definition

• `Private` **#definition**: `ManifestDefinition`

#### Defined in

[lib/manifestBuilder.ts:35](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L35)

___

### #ingredients

• `Private` **#ingredients**: `Record`<`string`, [`StorableIngredient`](../interfaces/StorableIngredient.md)\> = `{}`

#### Defined in

[lib/manifestBuilder.ts:39](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L39)

___

### #resourceStore

• `Private` **#resourceStore**: `Record`<`string`, `Buffer`\> = `{}`

#### Defined in

[lib/manifestBuilder.ts:37](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L37)

___

### requiredFields

▪ `Static` **requiredFields**: `string`[]

#### Defined in

[lib/manifestBuilder.ts:33](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L33)

## Accessors

### definition

• `get` **definition**(): `ManifestDefinition`

#### Returns

`ManifestDefinition`

#### Defined in

[lib/manifestBuilder.ts:104](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L104)

___

### sendableIngredients

• `get` **sendableIngredients**(): { `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[]

#### Returns

{ `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[]

#### Defined in

[lib/manifestBuilder.ts:108](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L108)

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

[lib/manifestBuilder.ts:71](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L71)

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

[lib/manifestBuilder.ts:85](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L85)

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

[lib/manifestBuilder.ts:117](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L117)

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

[lib/manifestBuilder.ts:94](https://github.com/contentauth/c2pa-node/blob/a776a47/js-src/lib/manifestBuilder.ts#L94)
