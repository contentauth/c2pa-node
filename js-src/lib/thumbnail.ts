import sharp, { type Metadata } from 'sharp';
import { ThumbnailError } from './error';

export interface ThumbnailOptions {
  maxSize: number;
  quality: number;
}

const defaultThumbnailOptions: ThumbnailOptions = {
  maxSize: 1024,
  quality: 0.35,
};

export async function createThumbnail(
  imageData: Buffer,
  options?: ThumbnailOptions,
): Promise<Buffer> {
  try {
    const opts = Object.assign({}, defaultThumbnailOptions, options);
    const { maxSize, quality: rawQuality } = opts;
    const input = sharp(imageData);
    const { hasAlpha } = await input.metadata();

    // Support both `0.8` and `80` for `quality`
    const quality = rawQuality <= 1 ? Math.round(rawQuality * 100) : rawQuality;

    const resized = input.resize({
      width: maxSize,
      height: maxSize,
      fit: 'inside',
    });
    const output = hasAlpha
      ? resized.png({ quality })
      : resized.jpeg({ quality });

    return output.toBuffer();
  } catch (err: unknown) {
    throw new ThumbnailError({ cause: err });
  }
}

export async function getMetadata(imageData: Buffer): Promise<Metadata> {
  try {
    return sharp(imageData).metadata();
  } catch (err: unknown) {
    throw new ThumbnailError({ cause: err });
  }
}
