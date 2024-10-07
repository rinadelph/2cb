import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useListings } from '../hooks/useListings';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';
import { supabase } from '../lib/supabaseClient';
import { Listing } from '../types/listing';

const listingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0).max(9999999999999.99, 'Price must be less than 10 trillion'),
  bedrooms: z.number().int().min(0).max(2147483647, 'Bedrooms must be a valid integer').nullable(),
  bathrooms: z.number().min(0).max(9999.9, 'Bathrooms must be 999.9 or less').nullable(),
  image: z.any().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  initialData?: Listing;
  onCancel?: () => void;
}

export default function ListingForm({ initialData, onCancel }: ListingFormProps) {
  const router = useRouter();
  const { createListing, updateListing } = useListings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(initialData?.image || '');

  const { register, handleSubmit, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      ...initialData,
      bedrooms: initialData?.bedrooms ?? null,
      bathrooms: initialData?.bathrooms ?? null,
    },
  });

  useEffect(() => {
    console.log('ListingForm mounted', { initialData });
  }, [initialData]);

  const onSubmit = async (data: ListingFormData) => {
    console.log('Form submitted', data);
    setIsSubmitting(true);
    try {
      let imageUrl = initialData?.image_url;
      if (data.image && data.image[0]) {
        const file = data.image[0];
        console.log('Uploading image');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(`${Date.now()}-${file.name}`, file);
        if (uploadError) throw new Error('Failed to upload image');
        imageUrl = supabase.storage.from('listing-images').getPublicUrl(uploadData.path).data.publicUrl;
      }

      const listingData = {
        ...data,
        image_url: imageUrl,
      };

      if (initialData) {
        console.log('Updating listing', initialData.id, listingData);
        await updateListing({ id: initialData.id, ...listingData });
        toast({ title: 'Success', description: 'Listing updated successfully' });
        router.push(`/listings/${initialData.id}`);
      } else {
        console.log('Creating new listing', listingData);
        const newListing = await createListing(listingData);
        toast({ title: 'Success', description: 'Listing created successfully' });
        router.push(`/listings/${newListing.id}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'An unknown error occurred', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          placeholder="Title"
          {...register('title')}
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <Textarea
          placeholder="Description"
          {...register('description')}
        />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}
      </div>
      <div>
        <Input
          type="number"
          placeholder="Price"
          {...register('price', { valueAsNumber: true })}
        />
        {errors.price && <p className="text-red-500">{errors.price.message}</p>}
      </div>
      <div>
        <Input
          type="number"
          placeholder="Bedrooms"
          {...register('bedrooms', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseInt(v, 10) })}
        />
        {errors.bedrooms && <p className="text-red-500">{errors.bedrooms.message}</p>}
      </div>
      <div>
        <Input
          type="number"
          placeholder="Bathrooms"
          {...register('bathrooms', { valueAsNumber: true, setValueAs: v => v === '' ? null : parseFloat(v) })}
        />
        {errors.bathrooms && <p className="text-red-500">{errors.bathrooms.message}</p>}
      </div>
      <div>
        <Input
          type="file"
          accept="image/*"
          {...register('image')}
        />
      </div>
      <div>
        <label htmlFor="image">Image URL:</label>
        <input
          type="text"
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
      </div>
      {initialData?.image_url && (
        <img src={initialData.image_url} alt="Current listing image" className="max-w-xs mt-2" />
      )}
      <div className="flex space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {initialData ? 'Update' : 'Create'} Listing
        </Button>
        {onCancel && <Button onClick={onCancel} variant="outline">Cancel</Button>}
      </div>
    </form>
  );
}