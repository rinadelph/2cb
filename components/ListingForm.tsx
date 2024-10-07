import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListings } from '../hooks/useListings';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { useToast } from './ui/use-toast';
import { Listing } from '../types/listing';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Toast } from '@/components/ui/toast'; // Make sure this import is correct for your project structure

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  property_type: z.string().min(1, 'Property type is required'),
  price: z.number().min(0, 'Price must be positive'),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  square_feet: z.number().int().min(0).nullable(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip_code: z.string().min(1, 'Zip code is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: z.string().default('active'),
  image: z.any().optional().nullable(),
  year_built: z.number().int().min(1800).max(new Date().getFullYear()).nullable(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  initialData?: Listing;
  onCancel?: () => void;
}

const ListingForm: React.FC<ListingFormProps> = ({ initialData, onCancel }) => {
  const { createListing, updateListing } = useListings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: initialData || {},
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
        image_url: imageUrl,
      };

      // Remove the image field from listingData as it's not needed in the database
      delete listingData.image;

      console.log('Submitting listing data:', listingData);

      if (initialData) {
        const updatedListing = await updateListing({ id: initialData.id, ...listingData });
        console.log('Listing updated successfully:', updatedListing);
        toast({
          title: 'Success',
          description: 'Listing updated successfully',
        } as Toast);
      } else {
        const newListing = await createListing(listingData);
        console.log('New listing created successfully:', newListing);
        toast({
          title: 'Success',
          description: 'Listing created successfully',
        } as Toast);
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
      } as Toast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypeOptions = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
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
            <Select 
              id="property_type" 
              {...register('property_type')}
              options={propertyTypeOptions}
            >
              <option value="">Select property type</option>
              {propertyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              <Label htmlFor="square_feet">Square Feet</Label>
              <Input 
                id="square_feet" 
                type="number" 
                {...register('square_feet', { 
                  valueAsNumber: true,
                  setValueAs: v => v === '' ? null : parseInt(v, 10)
                })} 
              />
              {errors.square_feet && <p className="text-sm text-red-500">{errors.square_feet.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" type="number" {...register('bedrooms', { valueAsNumber: true })} />
              {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" {...register('bathrooms', { valueAsNumber: true })} />
              {errors.bathrooms && <p className="text-sm text-red-500">{errors.bathrooms.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">Zip Code</Label>
            <Input id="zip_code" {...register('zip_code')} />
            {errors.zip_code && <p className="text-sm text-red-500">{errors.zip_code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input id="image" type="file" accept="image/*" {...register('image')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year_built">Year Built</Label>
            <Input 
              id="year_built" 
              type="number" 
              {...register('year_built', { 
                valueAsNumber: true,
                setValueAs: v => v === '' ? null : parseInt(v, 10)
              })} 
            />
            {errors.year_built && <p className="text-sm text-red-500">{errors.year_built.message}</p>}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : (initialData ? 'Update' : 'Create')} Listing
        </Button>
        {onCancel && <Button onClick={onCancel} variant="secondary">Cancel</Button>}
      </CardFooter>
    </Card>
  );
};

export default ListingForm;