import type { C2paOptions, Signer } from './';
import {
  CreateIngredientError,
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

const bindings = require(process.env.C2PA_LIBRARY_PATH ??
  '../generated/c2pa.node');

const missingErrors = [
  // No embedded or remote provenance found in the asset
  'C2pa(ProvenanceMissing)',
  // JUMBF not found
  'C2pa(JumbfNotFound)',
];

type ResourceStore = Record<string, ManifestResourceStore>;

interface ResolvedResource {
  format: string;
  data: Buffer | null;
}

interface ResolvedSignatureInfo extends SignatureInfo {
  timeObject?: Date | null;
}

interface ResolvedManifest extends Omit<Manifest, 'ingredients' | 'thumbnail'> {
  ingredients: ResolvedIngredient[];
  thumbnail: ResolvedResource | null;
  signature_info?: ResolvedSignatureInfo | null;
}

interface ResolvedManifestStore extends Omit<ManifestStore, 'active_manifest'> {
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

interface ResolvedIngredient extends Omit<Ingredient, 'thumbnail'> {
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

export interface Asset {
  mimeType: string;
  buffer: Buffer;
}

/**
 * Reads C2PA data from an asset
 * @param mimeType The MIME type of the asset, for instance `image/jpeg`
 * @param buffer A buffer containing the asset data
 * @returns A promise containing C2PA data, if present
 */
export async function read(
  asset: Asset,
): Promise<ResolvedManifestStore | null> {
  try {
    const { mimeType, buffer } = asset;
    const result = await bindings.read(mimeType, buffer);
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

export interface SignProps {
  asset: Asset;
  manifest: ManifestBuilder;
  thumbnail?: Asset | false;
}

export interface SignOutput {
  signedAsset: Asset;
  signedManifest?: Buffer;
}

export function createSign(options: C2paOptions) {
  return async function sign({
    asset,
    manifest,
    thumbnail,
  }: SignProps): Promise<SignOutput> {
    if (!options.signer) {
      throw new MissingSignerError();
    }

    try {
      const { mimeType, buffer } = asset;
      const signOpts = {
        format: mimeType,
        signer: options.signer,
      };
      if (!manifest.definition.thumbnail) {
        const thumbnailAsset =
          // Use thumbnail if provided
          thumbnail ||
          // Otherwise generate one if configured to do so
          (options.thumbnail && thumbnail !== false
            ? await createThumbnail(asset.buffer, options.thumbnail)
            : null);
        if (thumbnailAsset) {
          manifest.addThumbnail(thumbnailAsset);
        }
      }
      const result = await bindings.sign(
        manifest.asSendable(),
        buffer,
        signOpts,
      );
      const { assetBuffer: signedAssetBuffer, manifest: signedManifest } =
        result;
      const signedAsset: Asset = {
        mimeType,
        buffer: Buffer.from(signedAssetBuffer),
      };

      return {
        signedAsset,
        signedManifest: signedManifest
          ? Buffer.from(signedManifest)
          : undefined,
      };
    } catch (err: unknown) {
      throw new SigningError({ cause: err });
    }
  };
}

export interface SignClaimBytesProps {
  claim: Buffer;
  reserveSize: number;
  signer: Signer;
}

export async function signClaimBytes({
  claim,
  reserveSize,
  signer,
}: SignClaimBytesProps): Promise<Buffer> {
  try {
    const result = await bindings.sign_claim_bytes(claim, reserveSize, signer);

    return Buffer.from(result);
  } catch (err: unknown) {
    throw new SigningError({ cause: err });
  }
}

export type IngredientResourceStore = Record<string, Buffer>;

export interface StorableIngredient {
  ingredient: Ingredient;
  resources: IngredientResourceStore;
}

export interface CreateIngredientProps {
  // Asset containing the ingredient data
  asset: Asset;
  // Title of the ingredient
  title: string;
  // Pass an `Asset` if you would like to supply a thumbnail, or `false` to disable thumbnail generation
  // If no value is provided, a thumbnail will be generated if configured to do so globally
  thumbnail?: Asset | false;
}

export function createIngredientFunction(options: C2paOptions) {
  return async ({
    asset,
    title,
    thumbnail,
  }: CreateIngredientProps): Promise<StorableIngredient> => {
    try {
      const hash = labeledSha(asset, options.ingredientHashAlgorithm);
      const { ingredient: serializedIngredient, resources: existingResources } =
        await bindings.create_ingredient(asset.mimeType, asset.buffer);
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
        const thumbnailAsset =
          // Use thumbnail if provided
          thumbnail ||
          // Otherwise generate one if configured to do so
          (options.thumbnail && thumbnail !== false
            ? await createThumbnail(asset.buffer, options.thumbnail)
            : null);
        if (thumbnailAsset) {
          const resourceRef = getResourceReference(
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
