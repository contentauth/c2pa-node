import { randomUUID } from 'node:crypto';
import { name, version } from '../../package.json';
import { ManifestBuilderError } from '../lib/error';
import type { Manifest } from '../types';

export type ManifestDefinition = Partial<Omit<Manifest, 'signature_info'>> &
  Required<Pick<Manifest, 'claim_generator' | 'format'>>;

export type BaseManifestDefinition = Omit<
  Manifest,
  'thumbnail' | 'ingredients'
>;

export class ManifestBuilder {
  static requiredFields = ['claim_generator', 'format'];

  #definition: ManifestDefinition;

  // #ingredients: Record<string, StorableIngredient> = {};

  static get generator() {
    return `${name}/${version}`;
  }

  constructor(baseDefinition: BaseManifestDefinition) {
    const providedFields = Object.keys(baseDefinition);
    const missingFields = ManifestBuilder.requiredFields.filter(
      (x) => !providedFields.includes(x),
    );

    if (missingFields.length) {
      const cause = new Error(
        `Missing required fields: ${missingFields.join(', ')}`,
      );
      throw new ManifestBuilderError({ cause });
    }

    // Append Node library to claim generator
    const claimGenerator = baseDefinition.claim_generator.split(/\s+/);
    claimGenerator.push(ManifestBuilder.generator);
    baseDefinition.claim_generator = claimGenerator.join(' ');

    this.#definition = baseDefinition as ManifestDefinition;
  }

  public createLabel(vendor: string | null) {
    const urn = randomUUID();

    if (typeof vendor === 'string') {
      this.#definition.label = `${vendor.toLowerCase()}:${urn}`;
    }

    this.#definition.label = urn;
  }

  public get definition() {
    return this.#definition;
  }
}
