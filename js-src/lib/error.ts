export class ManifestBuilderError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Error creating manifest definition`, options);
    this.name = this.constructor.name;
  }
}
