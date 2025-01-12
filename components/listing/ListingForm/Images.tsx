'use client'

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ListingFormValues } from '@/schemas/listing';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/listings/image-upload';
import { ImageGrid } from '@/components/listings/ImageGrid';
import { useListingImages } from '@/hooks/useListingImages';
import { toast } from '@/components/ui/use-toast';

interface ImagesProps {
  methods: UseFormReturn<ListingFormValues>;
  listingId?: string;
}

export function Images({ methods, listingId }: ImagesProps) {
  if (!listingId) {
    return null; // Don't show image management until we have a listing ID
  }

  const {
    images,
    isLoading,
    deleteImage,
    reorderImages,
    refreshImages
  } = useListingImages({ listingId });

  const handleImageChange = async (newUrls: string[]) => {
    try {
      await refreshImages();
      toast({
        title: 'Success',
        description: 'Images updated successfully'
      });
    } catch (error) {
      console.error('Error updating images:', error);
      toast({
        title: 'Error',
        description: 'Failed to update images',
        variant: 'destructive'
      });
    }
  };

  const handleImageRemove = async (url: string) => {
    try {
      // Find the image with this URL and delete it
      const imageToDelete = images.find(img => img.url === url);
      if (imageToDelete) {
        await deleteImage(imageToDelete.id);
        toast({
          title: 'Success',
          description: 'Image deleted successfully'
        });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteImage(imageId);
      toast({
        title: 'Success',
        description: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive'
      });
    }
  };

  const handleReorder = async (startIndex: number, endIndex: number) => {
    try {
      await reorderImages(startIndex, endIndex);
      toast({
        title: 'Success',
        description: 'Images reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering images:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder images',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Images</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Upload images of your property. Drag to reorder images. The first image will be the featured image.
        </p>
        <ImageUpload
          value={images.map(img => img.url)}
          onChange={handleImageChange}
          onRemove={handleImageRemove}
          listingId={listingId}
          className="mb-4"
        />
      </div>

      <ImageGrid
        images={images}
        isLoading={isLoading}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
} 