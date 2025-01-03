import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { listingSchema } from '@/schemas/listing';
import { ListingBase } from '@/types/listing';
import { CommissionStructure } from '@/types/commission';
import { BasicInfo } from './BasicInfo';
import { LocationInfo } from './LocationInfo';
import { Features } from './Features';
import { Images } from './Images';
import { Commission } from './Commission';
import { useToast } from '@/components/ui/use-toast';
import { FieldError } from 'react-hook-form';

interface ListingFormProps {
  initialData?: Partial<ListingBase>;
  initialCommission?: Partial<CommissionStructure>;
  onSubmit: (data: ListingBase) => Promise<void>;
  onCommissionSubmit: (data: CommissionStructure) => Promise<void>;
}

export const ListingForm: React.FC<ListingFormProps> = ({
  initialData,
  initialCommission,
  onSubmit,
  onCommissionSubmit,
}) => {
  const { toast } = useToast();
  const form = useForm<ListingBase>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      property_type: 'single_family',
      listing_type: 'sale',
      price: 0,
      features: [],
      amenities: [],
      images: [],
      documents: [],
      meta_data: {},
      address: {
        street_number: '',
        street_name: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
      },
      location: {
        lat: 0,
        lng: 0,
      },
      user_id: '',
      ...initialData,
    },
  });

  const handleSubmit = async (data: ListingBase) => {
    console.log('Form submission started', { data });
    try {
      // Ensure required fields are present
      if (!data.title || !data.property_type || !data.listing_type || !data.price) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      // Ensure address fields are present
      if (!data.address?.street_number || !data.address?.street_name || !data.address?.city || !data.address?.state || !data.address?.zip) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required address fields",
          variant: "destructive"
        });
        return;
      }

      await onSubmit(data);
      toast({
        title: "Success",
        description: "Listing saved successfully",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to save listing. Please check the form and try again.",
        variant: "destructive"
      });
    }
  };

  const onError = (errors: any) => {
    console.log('Form validation failed:', errors);
    toast({
      title: "Validation Error",
      description: "Please fix the form errors and try again.",
      variant: "destructive"
    });
  };

  // Debug form state
  React.useEffect(() => {
    if (form.formState.errors && Object.keys(form.formState.errors).length > 0) {
      console.log('Form validation errors:', form.formState.errors);
    }
  }, [form.formState.errors]);

  // Helper function to get error message
  const getErrorMessage = (error: FieldError | string | undefined): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'Invalid value';
  };

  // Helper function to flatten errors
  const flattenErrors = (obj: Record<string, any>, prefix = ''): Array<{ key: string; message: string }> => {
    return Object.entries(obj || {}).reduce((acc: Array<{ key: string; message: string }>, [key, value]) => {
      const currentKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !value.message) {
        return [...acc, ...flattenErrors(value, currentKey)];
      }
      if (value) {
        return [...acc, { key: currentKey, message: getErrorMessage(value) }];
      }
      return acc;
    }, []);
  };

  // Debug current form values
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      console.log('Form values changed:', value);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit event triggered');
    form.handleSubmit(handleSubmit, onError)(e);
  };

  return (
    <div className="space-y-8">
      <form 
        onSubmit={handleFormSubmit}
        className="space-y-8"
        onChange={(e) => console.log('Form changed:', e)}
        onClick={(e) => console.log('Form clicked:', e)}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <BasicInfo form={form} />
          <LocationInfo form={form} />
        </div>
        <Features form={form} />
        <Images form={form} />
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button 
            type="submit"
            variant="default"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Saving...' : 'Save Listing'}
          </Button>
        </div>

        {/* Display all form errors */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="text-red-500 text-sm mt-4 p-4 border border-red-300 rounded">
            <h3 className="font-semibold mb-2">Please fix the following errors:</h3>
            <ul className="list-disc pl-4">
              {flattenErrors(form.formState.errors).map(({ key, message }) => (
                <li key={key}>
                  {key}: {message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm">
          {JSON.stringify(form.getValues(), null, 2)}
        </pre>
      </form>

      {form.watch('id') && (
        <div className="border-t pt-8">
          <Commission
            listingId={form.watch('id')}
            listingPrice={form.watch('price')}
            onSubmit={onCommissionSubmit}
            initialData={initialCommission}
          />
        </div>
      )}
    </div>
  );
}; 