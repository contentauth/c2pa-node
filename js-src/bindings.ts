import type {
  Manifest,
  ResourceStore as ManifestResourceStore,
  ManifestStore,
  ResourceRef,
  SignatureInfo,
} from './types';

const bindings = require('../generated/c2pa.node');

type ResourceStore = Record<string, ManifestResourceStore>;

interface ResolvedResource {
  format: string;
  data: Buffer | null;
}

interface ResolvedSignatureInfo extends SignatureInfo {
  timeObject?: Date | null;
}

interface ResolvedManifest extends Manifest {
  resolveResource(resource: ResourceRef): ResolvedResource;
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

/**
 * Reads C2PA data from an asset
 * @param mimeType The MIME type of the asset, for instance `image/jpeg`
 * @param buffer A buffer containing the asset data
 * @returns A promise containing C2PA data, if present
 */
export async function readAsset(
  mimeType: string,
  buffer: Buffer,
): Promise<ResolvedManifestStore> {
  const result = await bindings.read_asset(mimeType, buffer);
  const manifestStore = JSON.parse(result.manifest_store) as ManifestStore;
  const resourceStore = result.resource_store as ResourceStore;
  const activeManifestLabel = manifestStore.active_manifest;
  const manifests: ResolvedManifestStore['manifests'] = Object.keys(
    manifestStore.manifests,
  ).reduce((acc, label) => {
    const manifest = manifestStore.manifests[label] as Manifest;
    const resolvedManifest = {
      ...manifest,
      ...parseSignatureInfo(manifest),
      resolveResource(resource: ResourceRef) {
        const resolved = resourceStore[label][resource.identifier];
        return {
          format: resource.format,
          data: resolved?.buffer ? Buffer.from(resolved.buffer) : null,
        };
      },
    } as ResolvedManifest;

    return {
      ...acc,
      [label]: resolvedManifest,
    };
  }, {});

  return {
    active_manifest: activeManifestLabel
      ? manifests[activeManifestLabel]
      : null,
    manifests,
    validation_status: manifestStore.validation_status ?? [],
  };
}
