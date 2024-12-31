import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListings } from '../hooks/useListings';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { Listing } from '../types/listing';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Toast } from './ui/toast';

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  property_type: z.enum(['condo', 'townhouse', 'single_family', 'multi_family', 'land', 'commercial']),
  price: z.number().min(0, 'Price must be positive'),
  bedrooms: z.number().int().min(0),
  bathrooms_full: z.number().int().min(0),
  bathrooms_half: z.number().int().min(0),
  square_feet_living: z.number().int().min(0),
  square_feet_total: z.number().int().min(0),
  lot_size_sf: z.number().int().min(0),
  garage_spaces: z.number().int().min(0),
  carport_spaces: z.number().int().min(0),
  furnished: z.boolean().default(false),
  pool: z.boolean().default(false),
  waterfront: z.boolean().default(false),
  water_access: z.boolean().default(false),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  county: z.string().min(1, 'County is required'),
  folio_number: z.string().optional(),
  parcel_number: z.string().optional(),
  legal_description: z.string().optional(),
  tax_amount: z.number().optional(),
  tax_year: z.string().optional(),
  maintenance_fee: z.number().optional(),
  special_assessment: z.boolean().default(false),
  virtual_tour_url: z.string().optional(),
  broker_remarks: z.string().optional(),
  showing_instructions: z.string().optional(),
  listing_office: z.string().min(1, 'Listing office is required'),
  listing_agent_name: z.string().min(1, 'Listing agent name is required'),
  listing_agent_phone: z.string().min(1, 'Listing agent phone is required'),
  listing_agent_email: z.string().min(1, 'Listing agent email is required'),
  listing_agent_license: z.string().min(1, 'Listing agent license is required'),
  mls_number: z.string().optional(),
  status: z.enum(['active', 'draft', 'pending', 'sold', 'archived']).default('active'),
  year_built: z.string().optional(),
  image: z.any().optional().nullable(),
  construction_type: z.array(z.string()).default([]),
  interior_features: z.array(z.string()).default([]),
  exterior_features: z.array(z.string()).default([]),
  parking_description: z.array(z.string()).default([]),
  lot_description: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  initialData?: Partial<ListingFormData & { id: string; image_url: string }>;
  onCancel?: () => void;
}

const ListingForm: React.FC<ListingFormProps> = ({ initialData, onCancel }) => {
  const { createListing, updateListing } = useListings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = initialData ? {
    ...initialData,
    year_built: initialData.year_built ? Number(initialData.year_built) : null,
    status: initialData.status || 'active'
  } : {};

  const { register, handleSubmit, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues,
  });

  const onSubmit = async (data: ListingFormData) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    try {
      let imageUrl = initialData?.image_url;
      console.log('Initial image URL:', imageUrl);
      console.log('Image data:', data.image);

      if (data.image && data.image[0] && data.image[0] instanceof File) {
        console.log('Image file found:', data.image[0]);
        const file = data.image[0];
        console.log('File object:', file);
        console.log('File name:', file.name);

        const fileExt = file.name.split('.').pop();
        console.log('File extension:', fileExt);

        const fileName = `${Math.random()}.${fileExt}`;
        console.log('Generated file name:', fileName);

        console.log('Uploading image:', fileName);
        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);
        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
        console.log('Image uploaded successfully:', imageUrl);
      } else {
        console.log('No new image file to upload');
      }

      const listingData = {
        ...data,
        construction_type: [],
        interior_features: [],
        exterior_features: [],
        parking_description: [],
        lot_description: [],
        images: imageUrl ? [imageUrl] : [],
      };

      // Remove the image field from listingData as it's not needed in the database
      delete listingData.image;

      console.log('Submitting listing data:', listingData);

      if (initialData?.id) {
        const updatedListing = await updateListing({ id: initialData.id, ...listingData });
        console.log('Listing updated successfully:', updatedListing);
        toast({
          title: 'Success',
          description: 'Listing updated successfully',
        });
      } else {
        const newListing = await createListing(listingData);
        console.log('New listing created successfully:', newListing);
        toast({
          title: 'Success',
          description: 'Listing created successfully',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      toast({ 
        title: 'Error', 
        description: errorMessage,
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypeOptions = [
    { value: 'single_family' as const, label: 'Single Family' },
    { value: 'multi_family' as const, label: 'Multi Family' },
    { value: 'condo' as const, label: 'Condo' },
    { value: 'townhouse' as const, label: 'Townhouse' },
    { value: 'land' as const, label: 'Land' },
    { value: 'commercial' as const, label: 'Commercial' },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Listing' : 'Create New Listing'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_type">Property Type</Label>
            <Select onValueChange={(value) => register('property_type').onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.property_type && <p className="text-sm text-red-500">{errors.property_type.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" {...register('price', { valueAsNumber: true })} />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" {...register('bedrooms', { valueAsNumber: true })} />
              {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bathrooms_full">Full Bathrooms</Label>
              <Input id="bathrooms_full" type="number" {...register('bathrooms_full', { valueAsNumber: true })} />
              {errors.bathrooms_full && <p className="text-sm text-red-500">{errors.bathrooms_full.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms_half">Half Bathrooms</Label>
              <Input id="bathrooms_half" type="number" {...register('bathrooms_half', { valueAsNumber: true })} />
              {errors.bathrooms_half && <p className="text-sm text-red-500">{errors.bathrooms_half.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="square_feet_living">Living Square Feet</Label>
              <Input 
                id="square_feet_living" 
                type="number" 
                {...register('square_feet_living', { valueAsNumber: true })} 
              />
              {errors.square_feet_living && <p className="text-sm text-red-500">{errors.square_feet_living.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="square_feet_total">Total Square Feet</Label>
              <Input 
                id="square_feet_total" 
                type="number" 
                {...register('square_feet_total', { valueAsNumber: true })} 
              />
              {errors.square_feet_total && <p className="text-sm text-red-500">{errors.square_feet_total.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lot_size_sf">Lot Size (sq ft)</Label>
              <Input 
                id="lot_size_sf" 
                type="number" 
                {...register('lot_size_sf', { valueAsNumber: true })} 
              />
              {errors.lot_size_sf && <p className="text-sm text-red-500">{errors.lot_size_sf.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="garage_spaces">Garage Spaces</Label>
              <Input 
                id="garage_spaces" 
                type="number" 
                {...register('garage_spaces', { valueAsNumber: true })} 
              />
              {errors.garage_spaces && <p className="text-sm text-red-500">{errors.garage_spaces.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carport_spaces">Carport Spaces</Label>
              <Input 
                id="carport_spaces" 
                type="number" 
                {...register('carport_spaces', { valueAsNumber: true })} 
              />
              {errors.carport_spaces && <p className="text-sm text-red-500">{errors.carport_spaces.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_built">Year Built</Label>
              <Input 
                id="year_built" 
                type="text" 
                {...register('year_built')} 
              />
              {errors.year_built && <p className="text-sm text-red-500">{errors.year_built.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mls_number">MLS Number</Label>
              <Input 
                id="mls_number" 
                type="text" 
                {...register('mls_number')} 
              />
              {typeof errors.mls_number?.message === 'string' && (
                <p className="text-sm text-red-500">{errors.mls_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/*" {...register('image')} />
              {typeof errors.image?.message === 'string' && (
                <p className="text-sm text-red-500">{errors.image.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
            {typeof errors.address?.message === 'string' && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
              {typeof errors.city?.message === 'string' && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
              {typeof errors.state?.message === 'string' && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">Zip Code</Label>
            <Input id="zip_code" {...register('zip_code')} />
            {typeof errors.zip_code?.message === 'string' && (
              <p className="text-sm text-red-500">{errors.zip_code.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Listing' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ListingForm;