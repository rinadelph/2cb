'use client'

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ListingFormValues } from '@/schemas/listing';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/listings/image-upload';
import { ImageGrid } from '@/components/listings/ImageGrid';
import { useListingImages } from '@/hooks/useListingImages';
import { toast } from '@/components/ui/use-toast';

interface ImagesProps {
  _methods: UseFormReturn<ListingFormValues>;
  listingId?: string;
}

export function Images({ _methods, listingId }: ImagesProps) {
  const {
    images = [],
    isLoading: _isLoading = false,
    deleteImage = async () => {},
    reorderImages = async () => {},
    refreshImages = async () => {}
  } = useListingImages({ listingId: listingId || '' });

  const [_refreshImages, setRefreshImages] = useState(false);

  if (!listingId) {
    return null; // Don't show image management until we have a listing ID
  }

  const handleChange = (value: string[]) => {
    // This will be handled by the refreshImages call after upload
    console.log('Images changed:', value);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage(id);
      toast({
        title: 'Success',
        description: 'Image removed successfully'
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive'
      });
    }
  };

  const handleReorder = async (startIndex: number, endIndex: number) => {
    try {
      // Create new array with reordered images
      const newImages = [...images];
      const [movedImage] = newImages.splice(startIndex, 1);
      newImages.splice(endIndex, 0, movedImage);
      
      // Update display_order based on new positions
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        display_order: index
      }));

      await reorderImages(reorderedImages);
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
      <Label>Listing Images</Label>
      <ImageUpload
        value={images.map(img => img.url)}
        onChange={handleChange}
        onRemove={handleDelete}
        listingId={listingId}
      />
      {images.length > 0 && (
        <ImageGrid
          images={images}
          onDelete={handleDelete}
          onReorder={handleReorder}
          isLoading={_isLoading}
        />
      )}
    </div>
  );
} 