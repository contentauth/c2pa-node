export class ManifestBuilderError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Error creating manifest definition`, options);
    this.name = this.constructor.name;
  }
}

export class MissingSignerError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Signer not provided to options`, options);
  }
}

export class SigningError extends Error {
  constructor(options?: ErrorOptions) {
    super(`Signing error`, options);
  }
}
