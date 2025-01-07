'use client'

import React, { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ListingFormValues } from '@/schemas/listing';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/listings/image-upload';
import { ListingImage } from '@/types/image';

interface ImagesProps {
  methods: UseFormReturn<ListingFormValues>;
}

export function Images({ methods }: ImagesProps) {
  const { watch, setValue } = methods;
  const images = useMemo(() => watch('images') || [], [watch]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/listings/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { url, width, height, size, type } = await response.json();

      const newImage: ListingImage = {
        id: crypto.randomUUID(),
        url,
        width,
        height,
        size,
        type,
        position: images.length,
        is_featured: images.length === 0,
      };

      setValue('images', [...images, newImage] as ListingImage[]);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }, [images, setValue]);

  const handleRemoveImage = useCallback((index: number) => {
    setValue('images', images.filter((_, i) => i !== index));
  }, [images, setValue]);

  const handleSetFeatured = useCallback((index: number) => {
    setValue('images', images.map((img, i) => ({
      ...img,
      is_featured: i === index,
    })));
  }, [images, setValue]);

  const imageUrls = useMemo(() => images.map(img => img.url), [images]);
  const handleImageChange = useCallback((urls: string[]) => {
    // This won't be called directly since we're handling uploads ourselves
  }, []);
  const handleImageRemove = useCallback((url: string) => {
    const index = images.findIndex(img => img.url === url);
    if (index !== -1) {
      handleRemoveImage(index);
    }
  }, [images, handleRemoveImage]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Images</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Upload images of your property. The first image will be the featured image.
        </p>
        <ImageUpload
          value={imageUrls}
          onChange={handleImageChange}
          onRemove={handleImageRemove}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group aspect-video">
              <Image
                src={image.url}
                alt={`Property image ${index + 1}`}
                fill
                className={`object-cover rounded-lg ${image.is_featured ? 'ring-2 ring-primary' : ''}`}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.is_featured && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetFeatured(index)}
                  >
                    Set as Featured
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveImage(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 