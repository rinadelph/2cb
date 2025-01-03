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
import { createListing } from '@/lib/api';
import { useRouter } from 'next/router';
import { AUTH_ROUTES } from '@/lib/routes';

interface ListingFormProps {
  initialData?: Partial<ListingFormValues>;
  initialCommission?: Partial<CommissionStructure>;
  onCommissionSubmit: (data: CommissionStructure) => Promise<void>;
}

export const ListingForm: React.FC<ListingFormProps> = ({
  initialData,
  initialCommission,
  onCommissionSubmit,
}) => {
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
      
      // Location
      location: {
        type: 'Point',
        coordinates: [0, 0],
        lat: 0,
        lng: 0
      },
      
      // JSON fields
      features: {},
      amenities: {},
      images: [],
      documents: [],
      meta_data: {},
      
      // Commission defaults
      commission_status: 'draft',
      commission_visibility: 'private',
      
      ...initialData,
    },
  });

  const handleSubmit = async (formData: ListingFormValues) => {
    try {
      // Create listing with validated data
      const listing = await createListing(formData);
      
      // Handle commission if provided
      if (formData.commission_amount && formData.commission_type) {
        await onCommissionSubmit({
          amount: formData.commission_amount,
          type: formData.commission_type,
          status: formData.commission_status,
          visibility: formData.commission_visibility,
          listing_id: listing.id,
        });
      }

      toast({
        title: "Success",
        description: "Listing saved successfully",
      });

      // Redirect to the listing page
      router.push(`${AUTH_ROUTES.listings}/${listing.id}`);
      
    } catch (error) {
      console.error('Error creating listing:', error);
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
          <BasicInfo form={methods} />
          <LocationInfo form={methods} />
        </div>
        <PropertyDetails />
        <Features />
        <Images form={methods} />
        <Commission
          listingId={methods.watch('id')}
          listingPrice={methods.watch('price') || 0}
          onSubmit={onCommissionSubmit}
          initialData={initialCommission}
        />

        {/* Form Errors */}
        {Object.keys(methods.formState.errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <h3 className="font-semibold mb-2">Please fix the following errors:</h3>
            <ul className="list-disc pl-4">
              {Object.entries(methods.formState.errors).map(([field, error]) => (
                <li key={field} className="text-sm text-red-600">
                  {field}: {error?.message as string}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => methods.reset()}
          >
            Reset
          </Button>
          <Button 
            type="submit"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? 'Saving...' : 'Save Listing'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}; 