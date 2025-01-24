'use client'

import React from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { listingSchema, ListingFormValues } from '@/schemas/listing';
import { CommissionStructure } from '@/types/commission';
import { useToast } from '@/components/ui/use-toast';
import { createListing } from '@/lib/services/listings';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/listings/image-upload';
import { ListingImage } from '@/types/listing';
import { BasicInfo } from './BasicInfo';
import { LocationInfo } from './LocationInfo';
import { Features } from './Features';
import { Commission } from './Commission';
import { PropertyDetails } from './PropertyDetails';
import { FormProvider } from 'react-hook-form';

interface ListingFormProps {
  initialData?: Partial<ListingFormValues>;
  initialCommission?: Partial<CommissionStructure>;
  _onCommissionSubmit: (data: CommissionStructure) => Promise<void>;
  onSubmit?: (data: ListingFormValues) => Promise<void>;
  mode?: 'create' | 'edit';
}

export function ListingForm({
  initialData,
  initialCommission,
  _onCommissionSubmit,
  onSubmit,
  mode = 'create',
}: ListingFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const defaultLocation = {
    type: 'Point' as const,
    coordinates: [0, 0],
    lat: 0,
    lng: 0
  };

  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      property_type: 'single_family',
      listing_type: 'sale',
      price: 0,
      square_feet: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      year_built: undefined,
      lot_size: undefined,
      parking_spaces: undefined,
      stories: undefined,
      address_street_number: '',
      address_street_name: '',
      address_unit: undefined,
      city: '',
      state: '',
      zip_code: '',
      country: 'US',
      features: {},
      amenities: {},
      meta_data: {},
      commission_status: 'draft',
      commission_type: undefined,
      commission_amount: undefined,
      commission_terms: undefined,
      commission_visibility: undefined,
      location: defaultLocation,
      ...initialData
    }
  });

  const handleSubmit = async (formData: ListingFormValues) => {
    try {
      console.log('Submitting form data:', formData);
      
      const transformedData: ListingFormValues = {
        ...formData,
        images: (formData.images || []).map((_img: ListingImage) => ({
          id: _img.id || '',
          url: _img.url,
          position: _img.position,
          is_featured: _img.is_featured || false
        }))
      };

      if (mode === 'edit' && onSubmit) {
        await onSubmit(transformedData);
        toast({
          title: 'Success',
          description: 'Listing updated successfully'
        });
      } else {
        const { listing } = await createListing(transformedData);
        if (!listing) {
          throw new Error('Failed to create listing');
        }
        toast({
          title: 'Success',
          description: 'Listing created successfully'
        });
        router.push(`/listings/${listing.id}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit form',
        variant: 'destructive'
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <BasicInfo />
        <LocationInfo />
        <PropertyDetails />
        <Features _methods={methods} />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Images</Label>
          </div>
          <ImageUpload
            value={(methods.getValues('images') || []).map(_img => _img.url)}
            onChange={urls => {
              const currentImages = methods.getValues('images') || [];
              const newImages = urls.map((url, index) => ({
                id: `temp-${Date.now()}-${index}`,
                url,
                position: currentImages.length + index,
                is_featured: false
              }));
              methods.setValue('images', [...currentImages, ...newImages]);
            }}
            onRemove={url => {
              const currentImages = methods.getValues('images') || [];
              methods.setValue('images', currentImages.filter(_img => _img.url !== url));
            }}
            listingId={initialData?.id || ''}
            className="mb-4"
          />
        </div>
        <Commission 
          _listingId={methods.getValues('id')}
          listingPrice={methods.getValues('price') || 0}
          _onSubmit={_onCommissionSubmit}
          initialData={initialCommission}
        />
        <Button type="submit" className="w-full">
          {mode === 'edit' ? 'Update Listing' : 'Create Listing'}
        </Button>
      </form>
    </FormProvider>
  );
} 