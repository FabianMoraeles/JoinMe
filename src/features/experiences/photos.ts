import * as Crypto from 'expo-crypto';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { supabase } from '@/services/supabase/client';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.7;

// Resizes so the longest side is at most MAX_DIMENSION (skips resizing if already smaller) and
// re-encodes as JPEG at JPEG_QUALITY — plan §5.9 "Comprimirlas antes de subirlas". The picker's
// own `quality` option alone only re-encodes, it never touches pixel dimensions.
async function compressImage(uri: string, width: number, height: number): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  const longestSide = Math.max(width, height);
  if (longestSide > MAX_DIMENSION) {
    if (width >= height) {
      context.resize({ width: MAX_DIMENSION });
    } else {
      context.resize({ height: MAX_DIMENSION });
    }
  }
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  return result.uri;
}

interface UploadExperiencePhotoParams {
  localUri: string;
  width: number;
  height: number;
  coupleId: string;
  experienceId: string;
}

// Storage path convention matches plan §7 "rutas separadas por pareja": the bucket's RLS
// policies (supabase/migrations/0003_...) trust the first path segment as the couple id.
export async function uploadExperiencePhoto({
  localUri,
  width,
  height,
  coupleId,
  experienceId,
}: UploadExperiencePhotoParams): Promise<string> {
  const compressedUri = await compressImage(localUri, width, height);
  const arrayBuffer = await fetch(compressedUri).then((res) => res.arrayBuffer());
  const path = `${coupleId}/${experienceId}/${Crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from('experience-photos')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg' });
  if (error) throw error;

  return path;
}
