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

[lib/manifestBuilder.ts:37](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L37)

## Properties

### #definition

• `Private` **#definition**: `ManifestDefinition`

#### Defined in

[lib/manifestBuilder.ts:27](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L27)

___

### #ingredients

• `Private` **#ingredients**: `Record`<`string`, [`StorableIngredient`](../interfaces/StorableIngredient.md)\> = `{}`

#### Defined in

[lib/manifestBuilder.ts:31](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L31)

___

### #resourceStore

• `Private` **#resourceStore**: `Record`<`string`, `Buffer`\> = `{}`

#### Defined in

[lib/manifestBuilder.ts:29](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L29)

___

### requiredFields

▪ `Static` **requiredFields**: `string`[]

#### Defined in

[lib/manifestBuilder.ts:25](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L25)

## Accessors

### definition

• `get` **definition**(): `ManifestDefinition`

#### Returns

`ManifestDefinition`

#### Defined in

[lib/manifestBuilder.ts:96](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L96)

___

### sendableIngredients

• `get` **sendableIngredients**(): { `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[]

#### Returns

{ `ingredient`: `string` ; `resources`: [`IngredientResourceStore`](../modules.md#ingredientresourcestore)  }[]

#### Defined in

[lib/manifestBuilder.ts:100](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L100)

___

### generator

• `Static` `get` **generator**(): `string`

#### Returns

`string`

#### Defined in

[lib/manifestBuilder.ts:33](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L33)

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

[lib/manifestBuilder.ts:66](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L66)

___

### addThumbnail

▸ **addThumbnail**(`thumbnail`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `thumbnail` | [`Asset`](../interfaces/Asset.md) |

#### Returns

`void`

#### Defined in

[lib/manifestBuilder.ts:80](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L80)

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

[lib/manifestBuilder.ts:109](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L109)

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

[lib/manifestBuilder.ts:86](https://github.com/contentauth/c2pa-node/blob/8f4a321/js-src/lib/manifestBuilder.ts#L86)
