import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

interface UseListingImagesProps {
  listingId: string;
}

type ImageRecord = Database['public']['Tables']['listing_images']['Row'];
type DbClient = SupabaseClient<Database>;

interface Image {
  id: string;
  url: string;
  display_order: number;
}

export function useListingImages(props: UseListingImagesProps | null) {
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchImages = async () => {
    if (!props?.listingId) return;

    try {
      setIsLoading(true);
      setError(null);
      const supabase = getSupabaseClient() as DbClient;

      // Get images from the listing_images table
      const { data: imageRecords, error: fetchError } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', props.listingId)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      if (!imageRecords) return;

      // Get public URLs for each image
      const imagesWithUrls: Image[] = await Promise.all(imageRecords.map(async (record) => {
        const { data: { publicUrl } } = supabase
          .storage
          .from('listing-images')
          .getPublicUrl(record.image_path);

        return {
          id: record.id,
          url: publicUrl,
          display_order: record.display_order
        };
      }));

      setImages(imagesWithUrls);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch images'));
      toast.error('Failed to fetch images');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!props?.listingId) return;

    try {
      setIsLoading(true);
      const supabase = getSupabaseClient() as DbClient;

      // Get the image path before deletion
      const { data: image, error: fetchError } = await supabase
        .from('listing_images')
        .select('image_path')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;
      if (!image) throw new Error('Image not found');

      // Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from('listing-images')
        .remove([image.image_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('listing_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('Failed to delete image');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reorderImages = async (reorderedImages: Image[]) => {
    if (!props?.listingId) return;

    try {
      setIsLoading(true);
      const supabase = getSupabaseClient() as DbClient;

      // Optimistically update the UI
      setImages(reorderedImages);

      // Update display_order in the database
      const updates = reorderedImages.map((image, index) => ({
        id: image.id,
        display_order: index
      }));

      const { error } = await supabase.rpc('reorder_listing_images', {
        updates
      });

      if (error) throw error;

      toast.success('Images reordered successfully');
    } catch (err) {
      console.error('Error reordering images:', err);
      toast.error('Failed to reorder images');
      // Revert optimistic update on error
      await fetchImages();
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch images when listingId changes
  useEffect(() => {
    fetchImages();
  }, [props?.listingId]);

  return {
    images,
    isLoading,
    error,
    deleteImage,
    reorderImages,
    refreshImages: fetchImages
  };
} 