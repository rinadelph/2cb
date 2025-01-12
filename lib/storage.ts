import { SupabaseClient } from '@supabase/supabase-js';
import { File } from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export const STORAGE_BUCKET = 'listing-images';

export interface FormidableFile extends File {
  filepath: string;
  originalFilename: string;
  newFilename: string;
  mimetype: string;
  size: number;
}

export async function uploadListingImage(
  file: FormidableFile,
  listingId: string,
  supabase: SupabaseClient
): Promise<{ path: string; id: string }> {
  console.log('[uploadListingImage] Starting upload for listing:', listingId);

  try {
    // Read file content
    const fileContent = await sharp(file.filepath)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    // Generate unique file name
    const fileExt = file.originalFilename?.split('.').pop() || 'jpg';
    const imageId = uuidv4();
    const fileName = `${listingId}/${imageId}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .upload(fileName, fileContent, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get the current highest display order
    const { data: currentImages, error: queryError } = await supabase
      .from('listing_images')
      .select('display_order')
      .eq('listing_id', listingId)
      .order('display_order', { ascending: false })
      .limit(1);

    if (queryError) throw queryError;

    const nextDisplayOrder = currentImages?.[0]?.display_order + 1 || 0;

    // Create database record
    const { data: record, error: dbError } = await supabase
      .from('listing_images')
      .insert({
        id: imageId,
        listing_id: listingId,
        image_path: fileName,
        display_order: nextDisplayOrder,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    console.log('[uploadListingImage] Successfully uploaded image:', fileName);

    return {
      path: fileName,
      id: record.id,
    };
  } catch (error) {
    console.error('[uploadListingImage] Error uploading image:', error);
    throw error;
  }
}

export async function deleteListingImage(
  imagePath: string,
  supabase: SupabaseClient
): Promise<void> {
  console.log('[deleteListingImage] Deleting image:', imagePath);

  try {
    const { error: storageError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .remove([imagePath]);

    if (storageError) throw storageError;

    console.log('[deleteListingImage] Successfully deleted image from storage');
  } catch (error) {
    console.error('[deleteListingImage] Error deleting image:', error);
    throw error;
  }
}

export async function getImageDimensions(
  filePath: string
): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  } catch (error) {
    console.error('[getImageDimensions] Error getting image dimensions:', error);
    throw error;
  }
} 