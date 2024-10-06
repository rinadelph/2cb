import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema } from '../../../lib/validation/listingSchema';
import { getListing, updateListing } from '../../../lib/api/listings';
import { useAuth } from '../../../hooks/useAuth';
import { Input, Textarea, Select, Button, Checkbox } from '../../../components/ui';
import { ListingFormData } from '../../../types/listing';

const EditListingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchListing(id);
    } else {
      console.error('Invalid or missing listing ID');
      setError('Invalid listing ID');
      setIsLoading(false);
    }
  }, [id]);

  const fetchListing = async (listingId: string) => {
    try {
      const data = await getListing(listingId);
      if (data) {
        reset(data);
        setIsLoading(false);
      } else {
        throw new Error('Listing not found');
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to fetch listing');
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!user || !id || typeof id !== 'string') {
      setError('User not authenticated or invalid listing ID');
      return;
    }

    try {
      await updateListing(id, data, user.id);
      router.push(`/listings/${id}`);
    } catch (err) {
      console.error('Error updating listing:', err);
      setError('Failed to update listing');
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <Input id="title" {...register('title')} error={errors.title?.message} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <Textarea id="description" {...register('description')} error={errors.description?.message} />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <Input id="price" type="number" {...register('price', { valueAsNumber: true })} error={errors.price?.message} />
        </div>

        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms</label>
          <Input id="bedrooms" type="number" {...register('bedrooms', { valueAsNumber: true })} error={errors.bedrooms?.message} />
        </div>

        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms</label>
          <Input id="bathrooms" type="number" step="0.1" {...register('bathrooms', { valueAsNumber: true })} error={errors.bathrooms?.message} />
        </div>

        <div>
          <label htmlFor="square_footage" className="block text-sm font-medium text-gray-700">Square Footage</label>
          <Input id="square_footage" type="number" {...register('square_footage', { valueAsNumber: true })} error={errors.square_footage?.message} />
        </div>

        <div>
          <label htmlFor="year_built" className="block text-sm font-medium text-gray-700">Year Built</label>
          <Input id="year_built" type="number" {...register('year_built', { valueAsNumber: true })} error={errors.year_built?.message} />
        </div>

        <div>
          <label htmlFor="property_type" className="block text-sm font-medium text-gray-700">Property Type</label>
          <Select 
            id="property_type" 
            {...register('property_type')} 
            options={[
              { value: 'house', label: 'House' },
              { value: 'apartment', label: 'Apartment' },
              { value: 'condo', label: 'Condo' },
              { value: 'townhouse', label: 'Townhouse' },
            ]}
            error={errors.property_type?.message}
          />
        </div>

        <div>
          <Checkbox id="for_sale" {...register('for_sale')} label="For Sale" />
        </div>

        <div>
          <Checkbox id="for_rent" {...register('for_rent')} label="For Rent" />
        </div>

        <Button type="submit" className="w-full">
          Update Listing
        </Button>
      </form>
    </div>
  );
};

export default EditListingPage;