'use client'

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { listingSchema, ListingFormValues } from '@/schemas/listing';
import { CommissionStructure } from '@/types/commission';
import { BasicInfo } from './BasicInfo';
import { LocationInfo } from './LocationInfo';
import { Features } from './Features';
import { Images } from './Images';
import { Commission } from './Commission';
import { useToast } from '@/components/ui/use-toast';
import { FormProvider } from 'react-hook-form';
import { PropertyDetails } from './PropertyDetails';
import { createListing } from '@/lib/api/listings';
import { useRouter } from 'next/router';
import { AUTH_ROUTES } from '@/lib/routes';

interface ListingFormProps {
  initialData?: Partial<ListingFormValues>;
  initialCommission?: Partial<CommissionStructure>;
  onCommissionSubmit: (data: CommissionStructure) => Promise<void>;
  onSubmit?: (data: ListingFormValues) => Promise<void>;
  mode?: 'create' | 'edit';
}

export default function ListingForm({
  initialData,
  initialCommission,
  onCommissionSubmit,
  onSubmit,
  mode = 'create',
}: ListingFormProps) {
  const router = useRouter();
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
      
      // Address fields
      address_street_number: '',
      address_street_name: '',
      address_unit: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US',
      
      // Property details
      square_feet: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      year_built: undefined,
      lot_size: undefined,
      parking_spaces: undefined,
      stories: undefined,
      
      // Location
      location: {
        type: 'Point',
        coordinates: [0, 0],
        lat: 0,
        lng: 0
      },
      
      // Features and amenities
      features: {},
      amenities: {},
      
      // Media
      images: [],
      
      // Commission defaults
      commission_status: 'draft',
      commission_visibility: 'private',
      
      // Optional fields
      meta_data: {},
      
      ...initialData,
    },
  });

  const handleSubmit = async (formData: ListingFormValues) => {
    try {
      const transformedData = {
        ...formData,
        images: formData.images.map((img, index) => ({
          ...img,
          position: img.position ?? index,
        })),
      };

      if (mode === 'edit' && onSubmit) {
        await onSubmit(transformedData);
      } else {
        const listing = await createListing(transformedData);
        
        if (transformedData.commission_amount && transformedData.commission_type) {
          await onCommissionSubmit({
            amount: transformedData.commission_amount,
            type: transformedData.commission_type,
            status: transformedData.commission_status || 'draft',
            visibility: transformedData.commission_visibility || 'private',
            listing_id: listing.id,
          });
        }

        toast({
          title: "Success",
          description: "Listing saved successfully",
        });

        router.push(`${AUTH_ROUTES.listings}/${listing.id}`);
      }
    } catch (error) {
      console.error('Form Submission Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save listing",
        variant: "destructive"
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <BasicInfo />
          <LocationInfo />
        </div>
        <PropertyDetails />
        <Features />
        <Images methods={methods} />
        <Commission
          listingId={methods.watch('id')}
          listingPrice={methods.watch('price') || 0}
          onSubmit={onCommissionSubmit}
          initialData={initialCommission}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={!methods.formState.isDirty || methods.formState.isSubmitting || !methods.formState.isValid}
          >
            {methods.formState.isSubmitting ? 'Saving...' : 'Save Listing'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
} 