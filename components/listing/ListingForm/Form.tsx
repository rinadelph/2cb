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

interface ListingFormProps {
  initialData?: Partial<ListingFormValues>;
  initialCommission?: Partial<CommissionStructure>;
  _onCommissionSubmit: (data: CommissionStructure) => Promise<void>;
  _onSubmit?: (data: ListingFormValues) => Promise<void>;
  mode?: 'create' | 'edit';
}

export default function ListingForm({
  initialData,
  initialCommission,
  _onCommissionSubmit,
  _onSubmit,
  mode = 'create',
}: ListingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      status: 'draft',
      property_type: 'single_family',
      listing_type: 'sale',
      price: 0,
      address_street_number: '',
      address_street_name: '',
      address_unit: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US',
      square_feet: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      year_built: undefined,
      lot_size: undefined,
      parking_spaces: undefined,
      stories: undefined,
      location: {
        type: 'Point',
        coordinates: [0, 0],
        lat: 0,
        lng: 0
      },
      features: {},
      amenities: {},
      images: [],
      commission_status: 'draft',
      commission_visibility: 'private',
      meta_data: {},
    },
    mode: 'onChange',
  });

  // Debug form state
  React.useEffect(() => {
    console.log('Form State:', {
      isDirty: methods.formState.isDirty,
      isValid: methods.formState.isValid,
      errors: methods.formState.errors,
      values: methods.getValues(),
    });
  }, [methods]);

  const handleSubmit = async (formData: ListingFormValues) => {
    try {
      console.log('Submitting form data:', formData);
      
      const transformedData = {
        ...formData,
        images: formData.images.map((_img, index) => ({
          ..._img,
          position: _img.position ?? index,
        })),
      };

      if (mode === 'edit' && _onSubmit) {
        await _onSubmit(transformedData);
      } else {
        const listing = await createListing(transformedData);
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
        <Features />
        <Images _methods={methods} listingId={methods.getValues('id')} />
        <Commission
          _listingId={methods.getValues('id')}
          listingPrice={methods.getValues('price') || 0}
          initialData={initialCommission}
          _onSubmit={_onCommissionSubmit}
        />
        <Button type="submit" disabled={!methods.formState.isValid}>
          {mode === 'create' ? 'Create Listing' : 'Update Listing'}
        </Button>
      </form>
    </FormProvider>
  );
} 