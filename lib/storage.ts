import { getSupabaseClient } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';
import { File } from 'formidable';
import fs from 'fs/promises';
import { SupabaseClient } from '@supabase/supabase-js';

interface FormidableFile extends File {
  originalFilename: string;
  newFilename: string;
  filepath: string;
  mimetype: string;
  size: number;
}

const STORAGE_BUCKET = 'listing-images';

export async function uploadListingImage(file: FormidableFile, userId: string, supabase: SupabaseClient) {
  console.log('[Storage Debug] Starting upload with:', {
    userId,
    bucket: STORAGE_BUCKET
  });

  try {
    // Create a unique file path
    const fileExt = file.originalFilename?.split('.').pop() || 'jpg';
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    
    console.log('[Storage Debug] Generated file path:', {
      fileName,
      userId,
      fullPath: `${STORAGE_BUCKET}/${fileName}`
    });
    
    // Verify auth state before upload
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[Storage Debug] Auth state before upload:', {
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      matchesUserId: session?.user?.id === userId,
      accessToken: session?.access_token?.slice(0, 10) + '...'
    });
    
    console.log('Reading file from:', file.filepath);
    
    // Read the file content
    const fileContent = await fs.readFile(file.filepath);
    
    console.log('Uploading file to Supabase:', {
      bucket: STORAGE_BUCKET,
      fileName,
      contentType: file.mimetype,
      size: fileContent.length,
      userId,
      sessionUserId: session?.user?.id
    });
    
    // Create a storage-specific client with the session token
    const storageClient = supabase.storage.from(STORAGE_BUCKET);
    
    // Upload the file
    const { data, error } = await storageClient.upload(fileName, fileContent, {
      contentType: file.mimetype || 'image/jpeg',
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      console.error('Supabase storage error:', {
        error,
        bucket: STORAGE_BUCKET,
        fileName,
        userId,
        sessionUserId: session?.user?.id,
        hasSession: !!session
      });
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = storageClient.getPublicUrl(fileName);

    // Clean up the temporary file
    await fs.unlink(file.filepath).catch(console.error);

    return {
      path: data.path,
      url: publicUrl,
      size: file.size,
      type: file.mimetype || 'image/jpeg'
    };
  } catch (error) {
    // Clean up the temporary file in case of error
    await fs.unlink(file.filepath).catch(console.error);
    throw error;
  }
}

export async function deleteListingImage(path: string) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

export async function getImageDimensions(file: FormidableFile): Promise<{ width: number; height: number }> {
  // For now, return default dimensions since we can't easily get real dimensions on the server
  return {
    width: 800,  // Default width
    height: 600  // Default height
  };
} 