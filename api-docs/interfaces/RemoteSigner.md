[c2pa-node](../README.md) / RemoteSigner

# Interface: RemoteSigner

## Table of contents

### Properties

- [reserveSize](RemoteSigner.md#reservesize)
- [sign](RemoteSigner.md#sign)
- [type](RemoteSigner.md#type)

## Properties

### reserveSize

• **reserveSize**: () => `Promise`\<`number`\>

#### Type declaration

▸ (): `Promise`\<`number`\>

##### Returns

`Promise`\<`number`\>

#### Defined in

[lib/signer.ts:46](https://github.com/contentauth/c2pa-node/blob/796fe3f/js-src/lib/signer.ts#L46)

___

### sign

• **sign**: (`input`: [`SignInput`](SignInput.md)) => `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

#### Type declaration

▸ (`input`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | [`SignInput`](SignInput.md) |

##### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

#### Defined in

[lib/signer.ts:47](https://github.com/contentauth/c2pa-node/blob/796fe3f/js-src/lib/signer.ts#L47)

___

### type

• **type**: ``"remote"``

#### Defined in

[lib/signer.ts:45](https://github.com/contentauth/c2pa-node/blob/796fe3f/js-src/lib/signer.ts#L45)
