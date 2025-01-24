import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ListingFormValues } from '@/schemas/listing';
import { Card, CardContent } from '@/components/ui/card';
import { CustomInput } from '@/components/ui/custom-input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  HiHome,
  HiOfficeBuilding,
  HiShoppingBag,
  HiViewBoards
} from 'react-icons/hi';

interface PropertyTypeOption {
  value: ListingFormValues['property_type'];
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const propertyTypes: PropertyTypeOption[] = [
  {
    value: 'single_family',
    label: 'Single Family',
    Icon: HiHome,
    description: 'Traditional single-family home'
  },
  {
    value: 'multi_family',
    label: 'Multi Family',
    Icon: HiOfficeBuilding,
    description: 'Multiple units in one building'
  },
  {
    value: 'commercial',
    label: 'Commercial',
    Icon: HiShoppingBag,
    description: 'Commercial property'
  },
  {
    value: 'land',
    label: 'Land',
    Icon: HiViewBoards,
    description: 'Undeveloped land'
  }
];

interface BasicInfoStepProps {
  form: UseFormReturn<ListingFormValues>;
  onNext: () => void;
}

export function BasicInfoStep({ form, onNext }: BasicInfoStepProps) {
  const { register, formState: { errors }, watch } = form;
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="title">Listing Title</Label>
        <CustomInput
          id="title"
          placeholder="Enter a descriptive title"
          {...register('title')}
          error={errors.title?.message}
        />
      </div>

      <div className="space-y-4">
        <Label>Property Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {propertyTypes.map((type) => {
            const { Icon } = type;
            return (
              <Card 
                key={type.value}
                className={`cursor-pointer transition-all ${
                  watch('property_type') === type.value 
                    ? 'ring-2 ring-primary' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => form.setValue('property_type', type.value)}
              >
                <CardContent className="flex items-start p-4 space-x-4">
                  <Icon className="w-6 h-6 mt-1" />
                  <div>
                    <h3 className="font-medium">{type.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Listing Type</Label>
        <RadioGroup 
          defaultValue={watch('listing_type')}
          onValueChange={(value) => form.setValue('listing_type', value as ListingFormValues['listing_type'])}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sale" id="sale" />
            <Label htmlFor="sale">For Sale</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rent" id="rent" />
            <Label htmlFor="rent">For Rent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lease" id="lease" />
            <Label htmlFor="lease">For Lease</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
} 