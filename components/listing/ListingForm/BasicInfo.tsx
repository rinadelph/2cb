import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ListingBase } from '@/types/listing';

interface BasicInfoProps {
  form: UseFormReturn<ListingBase>;
}

export const BasicInfo: React.FC<BasicInfoProps> = ({ form }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter listing title"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Enter listing description"
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="property_type">Property Type</Label>
          <select
            id="property_type"
            {...register('property_type')}
            className={`w-full rounded-md border ${errors.property_type ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
          >
            <option value="">Select type</option>
            <option value="single_family">Single Family</option>
            <option value="multi_family">Multi Family</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
          {errors.property_type && (
            <p className="mt-1 text-sm text-red-500">{errors.property_type.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="listing_type">Listing Type</Label>
          <select
            id="listing_type"
            {...register('listing_type')}
            className={`w-full rounded-md border ${errors.listing_type ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
          >
            <option value="">Select type</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
            <option value="lease">Lease</option>
            <option value="auction">Auction</option>
          </select>
          {errors.listing_type && (
            <p className="mt-1 text-sm text-red-500">{errors.listing_type.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            {...register('price', { valueAsNumber: true })}
            placeholder="Enter price"
            className={errors.price ? 'border-red-500' : ''}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            {...register('status')}
            className={`w-full rounded-md border ${errors.status ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
            <option value="sold">Sold</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}; 