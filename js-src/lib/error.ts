import { Ingredient } from '../types';

export class ManifestBuilderError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Error creating manifest definition`, options);
    this.name = this.constructor.name;
  }
}

export class MissingSignerError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Signer not provided to options`, options);
    this.name = this.constructor.name;
  }
}

export class SigningError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Signing error`, options);
    this.name = this.constructor.name;
  }
}

export class CreateIngredientError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Error creating ingredient`, options);
    this.name = this.constructor.name;
  }
}

export class IngredientHashMissingError extends Error {
  public ingredient: Ingredient;

  constructor(ingredient: Ingredient, options?: ErrorOptions) {
    super(`The supplied ingredient is missing a hash value`, options);
    this.name = this.constructor.name;
    this.ingredient = ingredient;
  }
}

export class ThumbnailError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Error creating thumbnail`, options);
    this.name = this.constructor.name;
  }
}

export class InvalidStorageOptionsError extends Error {
  constructor(options?: ErrorOptions) {
    super(
      `Embedding and remote manifest URL are both disabled - one must be specified.`,
      options,
    );
    this.name = this.constructor.name;
  }
}
