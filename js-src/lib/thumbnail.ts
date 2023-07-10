import sharp, { type Metadata } from 'sharp';
import { Asset } from '..';
import { ThumbnailError } from './error';

export interface ThumbnailOptions {
  maxSize: number;
  quality: number;
}

export const defaultThumbnailOptions: ThumbnailOptions = {
  maxSize: 1024,
  quality: 0.8,
};

export async function createThumbnail(
  imageData: Buffer | string,
  options?: ThumbnailOptions,
): Promise<Asset | null> {
  try {
    const opts = Object.assign({}, defaultThumbnailOptions, options);
    const { maxSize, quality: rawQuality } = opts;
    const input = sharp(imageData);
    const { hasAlpha } = await input.metadata();

    // Support both `0.8` and `80` for `quality`
    const quality = rawQuality <= 1 ? Math.round(rawQuality * 100) : rawQuality;

    const resized = input
      .resize({
        width: maxSize,
        height: maxSize,
        fit: 'inside',
      })
      .grayscale();
    const output = hasAlpha
      ? resized.png({ quality })
      : resized.jpeg({ quality });
    const buffer = await output.toBuffer();

    return {
      mimeType: hasAlpha ? 'image/png' : 'image/jpeg',
      buffer,
    };
  } catch (err: unknown) {
    const thumbnailError = new ThumbnailError({ cause: err });
    console.warn(`Could not create thumbnail, omitting`, thumbnailError);

    return null;
  }
}
