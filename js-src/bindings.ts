/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import type { C2paOptions, Signer } from './';
import {
  CreateIngredientError,
  InvalidStorageOptionsError,
  MissingSignerError,
  SigningError,
} from './lib/error';
import { getResourceReference, labeledSha } from './lib/hash';
import { ManifestBuilder } from './lib/manifestBuilder';
import { createThumbnail } from './lib/thumbnail';
import type {
  Ingredient,
  Manifest,
  ResourceStore as ManifestResourceStore,
  ManifestStore,
  SignatureInfo,
} from './types';

const C2PA_LIBRARY_PATH = process.env.C2PA_LIBRARY_PATH;

const bindings = require(C2PA_LIBRARY_PATH ?? '../generated/c2pa.node');

const missingErrors = [
  // No embedded or remote provenance found in the asset
  'C2pa(ProvenanceMissing)',
  // JUMBF not found
  'C2pa(JumbfNotFound)',
];

export type ResourceStore = Record<string, ManifestResourceStore>;

export interface ResolvedResource {
  format: string;
  data: Buffer | null;
}

export interface ResolvedSignatureInfo extends SignatureInfo {
  timeObject?: Date | null;
}

export interface ResolvedManifest
  extends Omit<Manifest, 'ingredients' | 'thumbnail'> {
  ingredients: ResolvedIngredient[];
  thumbnail: ResolvedResource | null;
  signature_info?: ResolvedSignatureInfo | null;
}

export interface ResolvedManifestStore
  extends Omit<ManifestStore, 'active_manifest'> {
  active_manifest: ResolvedManifest | null;
  manifests: Record<string, ResolvedManifest>;
}

function parseSignatureInfo(manifest: Manifest) {
  const info = manifest.signature_info;
  if (!info) {
    return {};
  }

  return {
    signature_info: {
      ...info,
      timeObject:
        typeof info.time === 'string' ? new Date(info.time) : info.time,
    },
  };
}

export interface ResolvedIngredient extends Omit<Ingredient, 'thumbnail'> {
  manifest: Manifest | null;
  thumbnail: ResolvedResource | null;
}

function createIngredientResolver(
  manifestStore: ManifestStore,
  resourceStore: ManifestResourceStore,
) {
  return (ingredient: Ingredient): ResolvedIngredient => {
    const relatedManifest = ingredient.active_manifest;
    const thumbnailIdentifier = ingredient.thumbnail?.identifier;
    const thumbnailResource = thumbnailIdentifier
      ? resourceStore[thumbnailIdentifier]
      : null;

    return {
      ...ingredient,
      manifest: relatedManifest
        ? manifestStore.manifests[relatedManifest]
        : null,
      thumbnail: thumbnailResource
        ? {
            format: ingredient.thumbnail?.format ?? '',
            data: Buffer.from(thumbnailResource.buffer),
          }
        : null,
    };
  };
}

export function resolveManifest(
  manifestStore: ManifestStore,
  manifest: Manifest,
  resourceStore: ManifestResourceStore,
): ResolvedManifest {
  const thumbnailIdentifier = manifest.thumbnail?.identifier;
  const thumbnailResource = thumbnailIdentifier
    ? resourceStore[thumbnailIdentifier]
    : null;
  const ingredientResolver = createIngredientResolver(
    manifestStore,
    resourceStore,
  );

  return {
    ...manifest,
    ...parseSignatureInfo(manifest),
    ingredients: (manifest.ingredients ?? []).map(ingredientResolver),
    thumbnail: thumbnailResource
      ? {
          format: manifest.thumbnail?.format ?? '',
          data: Buffer.from(thumbnailResource.buffer),
        }
      : null,
  } as ResolvedManifest;
}

export interface BufferAsset {
  // A buffer containing the asset data
  buffer: Buffer;
  // The MIME type of the asset, for instance `image/jpeg`
  mimeType: string;
}

export interface FileAsset {
  // The path to the asset
  path: string;
  // The optional MIME type of the asset, for instance `image/jpeg`.
  // If not supplied, the MIME type will be inferred from the file extension, if available.
  mimeType?: string;
}

/**
 * An asset that can either be in memory or on disk
 */
export type Asset = BufferAsset | FileAsset;

/**
 * Reads C2PA data from an asset
 * @param asset
 * @returns A promise containing C2PA data, if present
 */
export async function read(
  asset: Asset,
): Promise<ResolvedManifestStore | null> {
  try {
    const result = await bindings.read(asset);
    const manifestStore = JSON.parse(result.manifest_store) as ManifestStore;
    const resourceStore = result.resource_store as ResourceStore;
    const activeManifestLabel = manifestStore.active_manifest;
    const manifests: ResolvedManifestStore['manifests'] = Object.keys(
      manifestStore.manifests,
    ).reduce((acc, label) => {
      const manifest = manifestStore.manifests[label] as Manifest;

      return {
        ...acc,
        [label]: resolveManifest(manifestStore, manifest, resourceStore[label]),
      };
    }, {});

    return {
      active_manifest: activeManifestLabel
        ? manifests[activeManifestLabel]
        : null,
      manifests,
      validation_status: manifestStore.validation_status ?? [],
    };
  } catch (err: unknown) {
    if (missingErrors.some((test) => test === (err as Error)?.name)) {
      return null;
    }
    throw err;
  }
}

export interface SignOptions {
  embed?: boolean;
  outputPath?: string;
  remoteManifestUrl?: string | null;
}

export type SignProps<AssetType extends Asset> = {
  // The manifest to sign and optionally embed
  manifest: ManifestBuilder;
  // The asset you want to sign
  asset: AssetType;
  // Allows you to pass in a thumbnail to be used instead of generating one, or `false` to prevent thumbnail generation
  thumbnail?: BufferAsset | false;
  // Allows you to pass in a custom signer for this operation instead of using the global signer (if passed)
  signer?: Signer;
  // Options for this operation
  options?: SignOptions;
};

export interface SignClaimBytesProps {
  claim: Buffer;
  reserveSize: number;
  signer: Signer;
}

export interface SignOutputData<AssetType extends Asset = Asset> {
  signedAsset: AssetType;
  signedManifest?: Buffer;
}

export type SignOutput<AssetType> = AssetType extends BufferAsset
  ? SignOutputData<BufferAsset>
  : AssetType extends FileAsset
  ? SignOutputData<FileAsset>
  : never;

export const defaultSignOptions: SignOptions = {
  embed: true,
};

export function createSign(globalOptions: C2paOptions) {
  return {
    /**
     * Signs a C2PA manifest and optionally embeds it in the asset
     * @param props
     * @returns
     */
    async sign<AssetType extends Asset>(
      props: SignProps<AssetType>,
    ): Promise<SignOutput<AssetType>> {
      const {
        asset,
        manifest,
        thumbnail,
        signer: customSigner,
        options,
      } = props;

      const signOptions = Object.assign({}, defaultSignOptions, options);
      const signer = customSigner ?? globalOptions.signer;
      const memoryFileTypes = ['image/jpeg', 'image/png'];

      if (!signer) {
        throw new MissingSignerError();
      }
      if (!signOptions.embed && !signOptions.remoteManifestUrl) {
        throw new InvalidStorageOptionsError();
      }
      if ('buffer' in asset && !memoryFileTypes.includes(asset.mimeType)) {
        throw new Error(
          `Only ${memoryFileTypes.join(
            ', ',
          )} files can be signed using a memory buffer.`,
        );
      }

      try {
        const signOpts = { ...signOptions, signer };
        if (!manifest.definition.thumbnail) {
          const thumbnailInput = 'buffer' in asset ? asset.buffer : asset.path;
          const thumbnailAsset =
            // Use thumbnail if provided
            thumbnail ||
            // Otherwise generate one if configured to do so
            (globalOptions.thumbnail && thumbnail !== false
              ? await createThumbnail(thumbnailInput, globalOptions.thumbnail)
              : null);
          if (thumbnailAsset) {
            await manifest.addThumbnail(thumbnailAsset);
          }
        }

        if ('buffer' in asset) {
          const { mimeType } = asset;
          const assetSignOpts = { ...signOpts, format: mimeType };
          const result = await bindings.sign(
            manifest.asSendable(),
            asset,
            assetSignOpts,
          );
          const { assetBuffer: signedAssetBuffer, manifest: signedManifest } =
            result;
          const signedAsset = {
            buffer: Buffer.from(signedAssetBuffer),
            mimeType,
          };

          return {
            signedAsset,
            signedManifest: signedManifest
              ? Buffer.from(signedManifest)
              : undefined,
          } as SignOutput<AssetType>;
        } else {
          const { mimeType } = asset;
          const { outputPath } = await bindings.sign(
            manifest.asSendable(),
            asset,
            signOpts,
          );

          return {
            signedAsset: {
              path: outputPath,
              mimeType,
            },
          } as SignOutput<AssetType>;
        }
      } catch (err: unknown) {
        throw new SigningError({ cause: err });
      }
    },

    /**
     * Signs the bytes of a C2PA claim
     * @param props
     * @returns The CBOR bytes of COSE_Sign1 (signature box of JUMBF)
     */
    async signClaimBytes({
      claim,
      reserveSize,
      signer,
    }: SignClaimBytesProps): Promise<Buffer> {
      try {
        const result = await bindings.sign_claim_bytes(
          claim,
          reserveSize,
          signer,
        );

        return Buffer.from(result);
      } catch (err: unknown) {
        throw new SigningError({ cause: err });
      }
    },
  };
}

export type IngredientResourceStore = Record<string, Buffer>;

export interface StorableIngredient {
  ingredient: Ingredient;
  resources: IngredientResourceStore;
}

export interface CreateIngredientProps {
  // The ingredient data to create an ingredient from. This can be an `Asset` if you want to process data in memory, or
  // a string if you want to pass in a path to a file to be processed.
  asset: Asset;
  // Title of the ingredient
  title: string;
  // Pass a `BufferAsset` if you would like to supply a thumbnail, or `false` to disable thumbnail generation
  // If no value is provided, a thumbnail will be generated if configured to do so globally
  thumbnail?: BufferAsset | false;
  // Optionally pass in a hash to use for the ingredient if one is available. If not provided, one will be generated.
  hash?: string;
}

export function createIngredientFunction(options: C2paOptions) {
  /**
   * @notExported
   * Creates a storable ingredient from an asset.
   *
   * This allows ingredient data to be extracted, optionally stored, and passed in during signing at a later time if needed.
   */
  return async function createIngredient({
    asset,
    title,
    thumbnail,
    hash: suppliedHash,
  }: CreateIngredientProps): Promise<StorableIngredient> {
    try {
      let serializedIngredient: string;
      let existingResources: Record<string, Uint8Array>;

      const hash =
        suppliedHash ??
        (await labeledSha(asset, options.ingredientHashAlgorithm));
      ({ ingredient: serializedIngredient, resources: existingResources } =
        await bindings.create_ingredient(asset));

      const ingredient = JSON.parse(serializedIngredient) as Ingredient;

      // Separate resources out into their own object so they can be stored more easily
      const resources: IngredientResourceStore = Object.keys(
        existingResources,
      ).reduce((acc, identifier) => {
        return {
          ...acc,
          [identifier]: Buffer.from(existingResources[identifier]),
        };
      }, {});

      // Clear out resources since we are not using this field
      ingredient.resources = undefined;
      ingredient.title = title;
      ingredient.hash = hash;

      // Generate a thumbnail if one doesn't exist on the ingredient's manifest
      if (!ingredient.thumbnail) {
        const thumbnailInput = 'buffer' in asset ? asset.buffer : asset.path;
        const thumbnailAsset =
          // Use thumbnail if provided
          thumbnail ||
          // Otherwise generate one if configured to do so
          (options.thumbnail && thumbnail !== false
            ? await createThumbnail(thumbnailInput ?? asset, options.thumbnail)
            : null);
        if (thumbnailAsset) {
          const resourceRef = await getResourceReference(
            thumbnailAsset,
            ingredient.instance_id,
          );
          ingredient.thumbnail = resourceRef;
          resources[resourceRef.identifier] = thumbnailAsset.buffer;
        }
      }

      return {
        ingredient,
        resources,
      };
    } catch (err: unknown) {
      throw new CreateIngredientError({ cause: err });
    }
  };
}
