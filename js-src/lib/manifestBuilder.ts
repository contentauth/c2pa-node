// import type { Manifest } from '../types';

// export type ManifestDefinition = Partial<Omit<Manifest, 'signature_info'>> &
//   Required<Pick<Manifest, 'claim_generator' | 'format'>>;

// export type BaseManifestDefinition = Omit<
//   Manifest,
//   'thumbnail' | 'ingredients'
// >;

// export class ManifestBuilder {
//   static requiredFields = ['claim_generator', 'format'];

//   constructor(baseDefinition: BaseManifestDefinition) {
//     // FIXME: figure out why this causes an unknown error in jasmine

//     const missingFields = difference(
//       ManifestBuilder.requiredFields,
//       Object.keys(baseDefinition),
//     );

//     if (missingFields.length) {
//       const cause = new Error(
//         `Missing required fields: ${missingFields.join(', ')}`,
//       );
//       throw new ManifestBuilderError({ cause });
//     }

//     this.#config = config;
//     this.#definition = baseDefinition;
//   }

//   public createLabel(vendor: string | null) {
//     const urn = crypto.randomUUID();

//     if (typeof vendor === 'string') {
//       this.#definition.label = `${vendor.toLowerCase()}:${urn}`;
//     }

//     this.#definition.label = urn;
//   }

//   public async addIngredient(input: IngredientInput) {
//     const hash = await sha(input.asset, 'SHA-256');
//     const thumbnailBlob =
//       input.thumbnail ??
//       // TODO: Clean this up
//       (this.#config.globalConfig.thumbnail !== false
//         ? await createThumbnail(
//             input.asset,
//             this.#config.dependencies.pool,
//             this.#config.globalConfig.thumbnail!,
//           )
//         : undefined);

//     if (!this.#ingredients.hasOwnProperty(hash)) {
//       this.#ingredients[hash] = {
//         title: input.title,
//         asset: await input.asset.arrayBuffer(),
//         format: input.asset.type,
//         hash,
//         thumbnail: thumbnailBlob
//           ? await thumbnailBlob.arrayBuffer()
//           : undefined,
//         thumbnail_format: thumbnailBlob?.type,
//         is_parent: !!input.isParent,
//       };
//     }
//   }

//   public get definition() {
//     return this.#definition;
//   }

//   public get ingredients() {
//     return Object.values(this.#ingredients);
//   }
// }

// export function createManifestBuilder(
//   c2paConfig: C2paConfig,
//   dependencies: SignDependencies,
// ) {
//   // TODO: Move into shared config function
//   const globalConfig: C2paConfig = merge({}, defaultGlobalConfig, c2paConfig);

//   return (baseDefinition: ManifestDefinition) => {
//     return new ManifestBuilder(baseDefinition, {
//       dependencies,
//       globalConfig,
//     });
//   };
// }
