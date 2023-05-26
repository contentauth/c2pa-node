import type {
  Manifest,
  ResourceStore as ManifestResourceStore,
  ManifestStore,
  ResourceRef,
} from './types.d.ts';

const bindings = require('../index.node');

type ResourceStore = Record<string, ManifestResourceStore>;

interface ResolvedResource {
  format: string;
  data: Buffer;
}

interface ResolvedManifest extends Manifest {
  resolveResource(resource: ResourceRef): ResolvedResource;
}

interface ResolvedManifestStore {
  activeManifest: ResolvedManifest | null;
  manifests: Record<string, ResolvedManifest>;
}

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
      resolveResource(resource: ResourceRef) {
        const resolved = resourceStore[label][resource.id];
        return {
          format: resolved.format,
          data: Buffer.from(resolved.data),
        };
      },
    } as ResolvedManifest;

    return {
      ...acc,
      [label]: resolvedManifest,
    };
  }, {});

  return {
    activeManifest: activeManifestLabel ? manifests[activeManifestLabel] : null,
    manifests,
  };
}
