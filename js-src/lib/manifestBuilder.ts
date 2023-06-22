import { randomUUID } from 'node:crypto';
import { StorableIngredient } from '..';
import { name, version } from '../../package.json';
import { IngredientHashMissingError, ManifestBuilderError } from '../lib/error';
import type { Manifest } from '../types';

export type ManifestDefinition = Partial<Omit<Manifest, 'signature_info'>> &
  Required<Pick<Manifest, 'claim_generator' | 'format'>>;

export type BaseManifestDefinition = Omit<
  Manifest,
  'thumbnail' | 'ingredients'
>;

export type ManifestBuilderOptions = {
  vendor?: string;
};

export class ManifestBuilder {
  static requiredFields = ['claim_generator', 'format'];

  #definition: ManifestDefinition;

  #ingredients: Record<string, StorableIngredient> = {};

  static get generator() {
    return `${name}/${version}`;
  }

  constructor(
    baseDefinition: BaseManifestDefinition,
    options?: ManifestBuilderOptions,
  ) {
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

    // Create a label if not provided
    if (!this.definition.label) {
      this.definition.label = ManifestBuilder.createLabel(options?.vendor);
    }
  }

  public addIngredient(input: StorableIngredient) {
    const { ingredient } = input;

    if (!ingredient.hash) {
      throw new IngredientHashMissingError(ingredient);
    }

    if (!this.#ingredients.hasOwnProperty(ingredient.hash)) {
      this.#ingredients[ingredient.hash] = input;
    }

    return this;
  }

  public static createLabel(vendor?: string) {
    const urn = randomUUID();

    if (vendor) {
      return `${vendor.toLowerCase()}:${urn}`;
    }

    return urn;
  }

  public get definition() {
    return this.#definition;
  }

  public get ingredients() {
    return Object.values(this.#ingredients);
  }
}
