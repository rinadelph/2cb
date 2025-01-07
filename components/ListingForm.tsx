'use client'

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { listingSchema, ListingFormValues } from '@/schemas/listing';
import { updateListing } from '@/lib/api/listings';

interface ListingFormProps {
  initialData?: Partial<ListingFormValues>;
}

export function ListingForm({ initialData }: ListingFormProps) {
  const { toast } = useToast();
  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      property_type: 'single_family',
      listing_type: 'sale',
      price: 0,
      ...initialData,
    },
  });

  const handleSubmit = async (listingData: ListingFormValues) => {
    try {
      if (initialData?.id) {
        // Transform the image data to match the expected format
        const transformedData: Partial<ListingFormValues> = {
          ...listingData,
          images: listingData.images?.map(img => ({
            id: img.id,
            url: img.url,
            width: img.width || 0,
            height: img.height || 0,
            size: img.size || 0,
            type: img.type || 'image/jpeg',
            is_featured: img.is_featured,
            position: img.position
          }))
        };

        // Pass id separately to updateListing
        await updateListing(initialData.id, transformedData);
        toast({
          title: 'Success',
          description: 'Listing updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update listing',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Form fields will be added here */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={!methods.formState.isDirty || methods.formState.isSubmitting}
            >
              {methods.formState.isSubmitting ? 'Saving...' : 'Update Listing'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}