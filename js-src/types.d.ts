/**
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it.
 */

/**
 * A Container for a set of Manifests and a ValidationStatus list
 */
export interface ManifestStore {
  /**
   * A label for the active (most recent) manifest in the store
   */
  active_manifest?: null | string;
  /**
   * A HashMap of Manifests
   */
  manifests: { [key: string]: Manifest };
  /**
   * ValidationStatus generated when loading the ManifestStore from an asset
   */
  validation_status?: ValidationStatus[] | null;
  [property: string]: any;
}

/**
 * A Manifest represents all the information in a c2pa manifest
 */
export interface Manifest {
  /**
   * A list of assertions
   */
  assertions?: ManifestAssertion[];
  /**
   * A User Agent formatted string identifying the software/hardware/system produced this
   * claim Spaces are not allowed in names, versions can be specified with product/1.0 syntax
   */
  claim_generator?: string;
  claim_generator_hints?: { [key: string]: any } | null;
  /**
   * A List of verified credentials
   */
  credentials?: any[] | null;
  /**
   * The format of the source file as a MIME type.
   */
  format?: string;
  /**
   * A List of ingredients
   */
  ingredients?: Ingredient[];
  /**
   * Instance ID from `xmpMM:InstanceID` in XMP metadata.
   */
  instance_id?: string;
  label?: null | string;
  /**
   * A list of redactions - URIs to a redacted assertions
   */
  redactions?: string[] | null;
  /**
   * container for binary assets (like thumbnails)
   */
  resources?: ResourceStore;
  /**
   * Signature data (only used for reporting)
   */
  signature_info?: null | SignatureInfo;
  thumbnail?: null | ResourceRef;
  /**
   * A human-readable title, generally source filename.
   */
  title?: null | string;
  /**
   * Optional prefix added to the generated Manifest Label This is typically Internet domain
   * name for the vendor (i.e. `adobe`)
   */
  vendor?: null | string;
  [property: string]: any;
}

/**
 * A labeled container for an Assertion value in a Manifest
 */
export interface ManifestAssertion {
  /**
   * The data of the assertion as Value
   */
  data: any;
  /**
   * There can be more than one assertion for any label
   */
  instance?: number | null;
  /**
   * The [ManifestAssertionKind] for this assertion (as stored in c2pa content)
   */
  kind?: ManifestAssertionKind | null;
  /**
   * An assertion label in reverse domain format
   */
  label: string;
  [property: string]: any;
}

/**
 * Assertions in C2PA can be stored in several formats
 */
export enum ManifestAssertionKind {
  Binary = 'Binary',
  Cbor = 'Cbor',
  JSON = 'Json',
  URI = 'Uri',
}

/**
 * An `Ingredient` is any external asset that has been used in the creation of an image.
 */
export interface Ingredient {
  /**
   * The active manifest label (if one exists).
   *
   * If this ingredient has a [`ManifestStore`], this will hold the label of the active
   * [`Manifest`].
   *
   * [`Manifest`]: crate::Manifest [`ManifestStore`]: crate::ManifestStore
   */
  active_manifest?: null | string;
  /**
   * Document ID from `xmpMM:DocumentID` in XMP metadata.
   */
  document_id?: null | string;
  /**
   * The format of the source file as a MIME type.
   */
  format?: string;
  /**
   * An optional hash of the asset to prevent duplicates.
   */
  hash?: null | string;
  /**
   * Instance ID from `xmpMM:InstanceID` in XMP metadata.
   */
  instance_id?: string;
  /**
   * A [`ManifestStore`] from the source asset extracted as a binary C2PA blob.
   *
   * [`ManifestStore`]: crate::ManifestStore
   */
  manifest_data?: null | ResourceRef;
  /**
   * Any additional [`Metadata`] as defined in the C2PA spec.
   *
   * [`Manifest`]: crate::Manifest
   */
  metadata?: null | Metadata;
  /**
   * URI from `dcterms:provenance` in XMP metadata.
   */
  provenance?: null | string;
  /**
   * Set to `ParentOf` if this is the parent ingredient.
   *
   * There can only be one parent ingredient in the ingredients.
   */
  relationship?: Relationship;
  resources?: ResourceStore;
  /**
   * A thumbnail image capturing the visual state at the time of import.
   *
   * A tuple of thumbnail MIME format (i.e. `image/jpeg`) and binary bits of the image.
   */
  thumbnail?: null | ResourceRef;
  /**
   * A human-readable title, generally source filename.
   */
  title: string;
  /**
   * Validation results.
   */
  validation_status?: ValidationStatus[] | null;
  [property: string]: any;
}

/**
 * A reference to a resource to be used in JSON serialization
 */
export interface ResourceRef {
  format: string;
  identifier: string;
  [property: string]: any;
}

/**
 * The Metadata structure can be used as part of other assertions or on its own to reference
 * others
 */
export interface Metadata {
  data_source?: null | DataSource;
  dateTime?: null | string;
  reference?: null | HashedURI;
  reviewRatings?: ReviewRating[] | null;
  [property: string]: any;
}

/**
 * A description of the source for assertion data
 */
export interface DataSource {
  /**
   * A list of [`Actor`]s associated with this source.
   */
  actors?: Actor[] | null;
  /**
   * A human-readable string giving details about the source of the assertion data.
   */
  details?: null | string;
  /**
   * A value from among the enumerated list indicating the source of the assertion.
   */
  type: string;
  [property: string]: any;
}

/**
 * Identifies a person responsible for an action.
 */
export interface Actor {
  /**
   * List of references to W3C Verifiable Credentials.
   */
  credentials?: HashedURI[] | null;
  /**
   * An identifier for a human actor, used when the "type" is `humanEntry.identified`.
   */
  identifier?: null | string;
  [property: string]: any;
}

/**
 * Hashed Uri stucture as defined by C2PA spec It is annotated to produce the correctly
 * tagged cbor serialization
 */
export interface HashedURI {
  alg?: null | string;
  hash: number[];
  url: string;
  [property: string]: any;
}

/**
 * A rating on an [`Assertion`].
 *
 * See
 * <https://c2pa.org/specifications/specifications/1.0/specs/C2PA_Specification.html#_claim_review>.
 */
export interface ReviewRating {
  code?: null | string;
  explanation: string;
  value: number;
  [property: string]: any;
}

/**
 * Set to `ParentOf` if this is the parent ingredient.
 *
 * There can only be one parent ingredient in the ingredients.
 */
export enum Relationship {
  ComponentOf = 'componentOf',
  ParentOf = 'parentOf',
}

/**
 * Resource store to contain binary objects referenced from JSON serializable structures
 *
 * container for binary assets (like thumbnails)
 */
export interface ResourceStore {
  base_path?: null | string;
  resources: { [key: string]: number[] };
  [property: string]: any;
}

/**
 * A `ValidationStatus` struct describes the validation status of a specific part of a
 * manifest.
 *
 * See
 * <https://c2pa.org/specifications/specifications/1.0/specs/C2PA_Specification.html#_existing_manifests>.
 */
export interface ValidationStatus {
  code: string;
  explanation?: null | string;
  url?: null | string;
  [property: string]: any;
}

/**
 * Holds information about a signature
 */
export interface SignatureInfo {
  /**
   * human readable issuing authority for this signature
   */
  issuer?: null | string;
  /**
   * the time the signature was created
   */
  time?: null | string;
  [property: string]: any;
}
