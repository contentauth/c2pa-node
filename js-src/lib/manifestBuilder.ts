/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

import { randomUUID } from 'node:crypto';
import type { BufferAsset, StorableIngredient } from '..';
import { IngredientHashMissingError, ManifestBuilderError } from '../lib/error';
import type { Manifest } from '../types';
import { getResourceReference } from './hash';

type RequiredFields = Required<Pick<Manifest, 'claim_generator' | 'format'>>;

export type ManifestDefinition = Partial<Omit<Manifest, 'signature_info'>> &
  RequiredFields;

export type BaseManifestDefinition = Omit<
  ManifestDefinition,
  'thumbnail' | 'ingredients'
> &
  RequiredFields;

// TODO: Add support for embedded / remote manifests
export type ManifestBuilderOptions = {
  vendor?: string;
};

export class ManifestBuilder {
  static requiredFields = ['claim_generator', 'format'];

  #definition: ManifestDefinition;

  #resourceStore: Record<string, Buffer> = {};

  #ingredients: Record<string, StorableIngredient> = {};

  constructor(
    baseDefinition: BaseManifestDefinition,
    options?: ManifestBuilderOptions,
  ) {
    const localDefinition = Object.assign({}, baseDefinition);
    const providedFields = Object.keys(localDefinition);
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
    const claimGenerator = localDefinition.claim_generator.split(/\s+/);
    // FIXME: This should be the actual version
    claimGenerator.push(`c2pa-node/0.0.0`);
    localDefinition.claim_generator = claimGenerator.join(' ');

    this.#definition = localDefinition as ManifestDefinition;

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

  public async addThumbnail(thumbnail: BufferAsset) {
    const resourceRef = await getResourceReference(
      thumbnail,
      this.#definition.label,
    );
    this.#definition.thumbnail = resourceRef;
    this.#resourceStore[resourceRef.identifier] = thumbnail.buffer;
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

  get sendableIngredients() {
    return Object.values(this.#ingredients).map(({ ingredient, resources }) => {
      return {
        ingredient: JSON.stringify(ingredient),
        resources,
      };
    }, {});
  }

  public asSendable() {
    return {
      manifest: JSON.stringify(this.definition),
      resourceStore: this.#resourceStore,
      ingredients: this.sendableIngredients,
    };
  }
}
