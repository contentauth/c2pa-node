import piscina from 'piscina';
import type { C2paOptions } from './';
import { SigningError } from './lib/error';
import { ManifestBuilder } from './lib/manifestBuilder';
import type {
  Manifest,
  ResourceStore as ManifestResourceStore,
  ManifestStore,
  SignatureInfo,
} from './types';

const bindings = require(process.env.C2PA_LIBRARY_PATH ??
  '../generated/c2pa.node');

const missingErrors = [
  // No embedded or remote provenance found in the asset
  'ProvenanceMissing',
  // JUMBF not found
  'JumbfNotFound',
];

type ResourceStore = Record<string, ManifestResourceStore>;

interface ResolvedResource {
  format: string;
  data: Buffer | null;
}

interface ResolvedSignatureInfo extends SignatureInfo {
  timeObject?: Date | null;
}

interface ResolvedManifest extends Omit<Manifest, 'thumbnail'> {
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

export function resolveManifest(
  manifest: Manifest,
  resourceStore: ManifestResourceStore,
): ResolvedManifest {
  const thumbnailIdentifier = manifest.thumbnail?.identifier;
  const thumbnailResource = thumbnailIdentifier
    ? resourceStore[thumbnailIdentifier]
    : null;

  return {
    ...manifest,
    ...parseSignatureInfo(manifest),
    thumbnail: thumbnailResource
      ? {
          format: manifest.thumbnail?.format ?? '',
          data: thumbnailResource.buffer,
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
        [label]: resolveManifest(manifest, resourceStore[label]),
      };
    }, {});

    // TODO: Add transferable support
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
  options: C2paOptions;
}

export async function sign({
  asset,
  manifest,
  options,
}: SignProps): Promise<Asset> {
  try {
    const { mimeType, buffer } = asset;
    const serializedManifest = JSON.stringify(manifest);
    const result = await bindings.sign(serializedManifest, {}, buffer, {
      format: mimeType,
      signer: options.signer,
    });

    return {
      mimeType,
      buffer: Buffer.from(result),
    };
  } catch (err: unknown) {
    throw new SigningError({ cause: err });
  }
}
