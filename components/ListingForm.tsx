import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateListingData } from '../types/listing';
import { FormField } from './FormField';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0).max(9999999999999.99, 'Price must be less than 10 trillion'),
  bedrooms: z.number().int().min(0).max(2147483647, 'Bedrooms must be a valid integer'),
  bathrooms: z.number().min(0).max(9999.9, 'Bathrooms must be 9999.9 or less'),
  address: z.string().min(1, 'Address is required'),
  square_footage: z.number().int().min(0).max(2147483647, 'Square footage must be a valid integer'),
  year_built: z.number().int().min(1800).max(new Date().getFullYear(), 'Year built must be valid'),
  property_type: z.string().min(1, 'Property type is required'),
  status: z.string().optional(),
  for_lease: z.boolean(),
  front_exposure: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  hopa: z.boolean(),
  lot_size: z.number().min(0).max(9999999999999.99, 'Lot size must be less than 10 trillion sq ft'),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  onSubmit: (data: CreateListingData) => Promise<void>;
  onError: (error: Error) => void;
  onSuccess: () => void;
}

export function ListingForm({ onSubmit, onError, onSuccess }: ListingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      address: '',
      city: '',
      state: '',
      zip_code: '',
      square_footage: 0,
      property_type: '',
      front_exposure: '',
      hopa: false,
      for_lease: false,
      year_built: new Date().getFullYear(),
      lot_size: 0,
    },
  });

  const handleFormSubmit = async (data: CreateListingData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onSuccess();
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <FormField label="Title" error={errors.title}>
            <Input {...field} placeholder="Enter listing title" />
          </FormField>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <FormField label="Description" error={errors.description}>
            <Textarea {...field} placeholder="Enter listing description" />
          </FormField>
        )}
      />

      <Controller
        name="price"
        control={control}
        render={({ field: { onChange, ...rest } }) => (
          <FormField label="Price" error={errors.price}>
            <Input
              {...rest}
              type="number"
              step="0.01"
              min="0"
              max="9999999999999.99"
              onChange={(e) => onChange(parseFloat(e.target.value))}
              placeholder="Enter price"
            />
          </FormField>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="bedrooms"
          control={control}
          render={({ field: { onChange, ...rest } }) => (
            <FormField label="Bedrooms" error={errors.bedrooms}>
              <Input
                {...rest}
                type="number"
                min="0"
                max="2147483647"
                onChange={(e) => onChange(parseInt(e.target.value, 10))}
                placeholder="Number of bedrooms"
              />
            </FormField>
          )}
        />

        <Controller
          name="bathrooms"
          control={control}
          render={({ field: { onChange, ...rest } }) => (
            <FormField label="Bathrooms" error={errors.bathrooms}>
              <Input
                {...rest}
                type="number"
                min="0"
                max="9999.9"
                step="0.1"
                onChange={(e) => onChange(parseFloat(e.target.value))}
                placeholder="Number of bathrooms"
              />
            </FormField>
          )}
        />
      </div>

      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <FormField label="Address" error={errors.address}>
            <Input {...field} placeholder="Enter street address" />
          </FormField>
        )}
      />

      <div className="grid grid-cols-3 gap-4">
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <FormField label="City" error={errors.city}>
              <Input {...field} placeholder="City" />
            </FormField>
          )}
        />

        <Controller
          name="state"
          control={control}
          render={({ field }) => (
            <FormField label="State" error={errors.state}>
              <Select
                {...field}
                options={[
                  { value: 'AL', label: 'Alabama' },
                  { value: 'AK', label: 'Alaska' },
                  { value: 'AZ', label: 'Arizona' },
                  { value: 'AR', label: 'Arkansas' },
                  { value: 'CA', label: 'California' },
                  { value: 'CO', label: 'Colorado' },
                  { value: 'CT', label: 'Connecticut' },
                  { value: 'DE', label: 'Delaware' },
                  { value: 'FL', label: 'Florida' },
                  { value: 'GA', label: 'Georgia' },
                  { value: 'HI', label: 'Hawaii' },
                  { value: 'ID', label: 'Idaho' },
                  { value: 'IL', label: 'Illinois' },
                  { value: 'IN', label: 'Indiana' },
                  { value: 'IA', label: 'Iowa' },
                  { value: 'KS', label: 'Kansas' },
                  { value: 'KY', label: 'Kentucky' },
                  { value: 'LA', label: 'Louisiana' },
                  { value: 'ME', label: 'Maine' },
                  { value: 'MD', label: 'Maryland' },
                  { value: 'MA', label: 'Massachusetts' },
                  { value: 'MI', label: 'Michigan' },
                  { value: 'MN', label: 'Minnesota' },
                  { value: 'MS', label: 'Mississippi' },
                  { value: 'MO', label: 'Missouri' },
                  { value: 'MT', label: 'Montana' },
                  { value: 'NE', label: 'Nebraska' },
                  { value: 'NV', label: 'Nevada' },
                  { value: 'NH', label: 'New Hampshire' },
                  { value: 'NJ', label: 'New Jersey' },
                  { value: 'NM', label: 'New Mexico' },
                  { value: 'NY', label: 'New York' },
                  { value: 'NC', label: 'North Carolina' },
                  { value: 'ND', label: 'North Dakota' },
                  { value: 'OH', label: 'Ohio' },
                  { value: 'OK', label: 'Oklahoma' },
                  { value: 'OR', label: 'Oregon' },
                  { value: 'PA', label: 'Pennsylvania' },
                  { value: 'RI', label: 'Rhode Island' },
                  { value: 'SC', label: 'South Carolina' },
                  { value: 'SD', label: 'South Dakota' },
                  { value: 'TN', label: 'Tennessee' },
                  { value: 'TX', label: 'Texas' },
                  { value: 'UT', label: 'Utah' },
                  { value: 'VT', label: 'Vermont' },
                  { value: 'VA', label: 'Virginia' },
                  { value: 'WA', label: 'Washington' },
                  { value: 'WV', label: 'West Virginia' },
                  { value: 'WI', label: 'Wisconsin' },
                  { value: 'WY', label: 'Wyoming' },
                  // Add more states as needed
                ]}
                placeholder="Select state"
              />
            </FormField>
          )}
        />

        <Controller
          name="zip_code"
          control={control}
          render={({ field }) => (
            <FormField label="Zip Code" error={errors.zip_code}>
              <Input {...field} placeholder="Zip code" />
            </FormField>
          )}
        />
      </div>

      <Controller
        name="square_footage"
        control={control}
        render={({ field: { onChange, ...rest } }) => (
          <FormField label="Square Footage" error={errors.square_footage}>
            <Input
              {...rest}
              type="number"
              min="0"
              max="2147483647"
              onChange={(e) => onChange(parseInt(e.target.value, 10))}
              placeholder="Enter square footage"
            />
          </FormField>
        )}
      />

      <Controller
        name="property_type"
        control={control}
        render={({ field }) => (
          <FormField label="Property Type" error={errors.property_type}>
            <Select
              {...field}
              options={[
                { value: 'house', label: 'House' },
                { value: 'apartment', label: 'Apartment' },
                { value: 'condo', label: 'Condo' },
                { value: 'townhouse', label: 'Townhouse' },
                // Add more property types as needed
              ]}
              placeholder="Select property type"
            />
          </FormField>
        )}
      />

      <Controller
        name="front_exposure"
        control={control}
        render={({ field }) => (
          <FormField label="Front Exposure" error={errors.front_exposure}>
            <Select
              {...field}
              options={[
                { value: 'north', label: 'North' },
                { value: 'south', label: 'South' },
                { value: 'east', label: 'East' },
                { value: 'west', label: 'West' },
              ]}
              placeholder="Select front exposure"
            />
          </FormField>
        )}
      />

      <div className="flex space-x-4">
        <Controller
          name="hopa"
          control={control}
          render={({ field }) => (
            <FormField>
              <Checkbox {...field} id="hopa" label="HOPA" />
            </FormField>
          )}
        />

        <Controller
          name="for_lease"
          control={control}
          render={({ field }) => (
            <FormField>
              <Checkbox {...field} id="for_lease" label="For Lease" />
            </FormField>
          )}
        />
      </div>

      <Controller
        name="year_built"
        control={control}
        render={({ field: { onChange, ...rest } }) => (
          <FormField label="Year Built" error={errors.year_built}>
            <Input
              {...rest}
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              onChange={(e) => onChange(parseInt(e.target.value, 10))}
              placeholder="Year built"
            />
          </FormField>
        )}
      />

      <Controller
        name="lot_size"
        control={control}
        render={({ field: { onChange, ...rest } }) => (
          <FormField label="Lot Size (sq ft)" error={errors.lot_size}>
            <Input
              {...rest}
              type="number"
              min="0"
              max="9999999999999.99"
              step="0.01"
              onChange={(e) => onChange(parseFloat(e.target.value))}
              placeholder="Enter lot size"
            />
          </FormField>
        )}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Create Listing'}
      </Button>
    </form>
  );
}