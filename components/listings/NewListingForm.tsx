import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema, ListingFormValues } from '@/schemas/listing';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { LocationStep } from './steps/LocationStep';
import { PropertyDetailsStep } from './steps/PropertyDetailsStep';
import { FeaturesStep } from './steps/FeaturesStep';
import { Button } from '@/components/ui/button';

export function NewListingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const methods = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      property_type: 'single_family',
      listing_type: 'sale',
      price: 0,
    },
  });

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep form={methods} onNext={handleNext} />;
      case 1:
        return <LocationStep form={methods} onNext={handleNext} />;
      case 2:
        return <PropertyDetailsStep form={methods} onNext={handleNext} />;
      case 3:
        return <FeaturesStep form={methods} onNext={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Create New Listing</h2>
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <div className={`h-2 w-2 rounded-full ${currentStep >= 0 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`h-2 w-2 rounded-full ${currentStep >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`h-2 w-2 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`h-2 w-2 rounded-full ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`h-2 w-2 rounded-full ${currentStep >= 4 ? 'bg-primary' : 'bg-gray-200'}`} />
            </div>
            <span className="text-sm text-muted-foreground">Step {currentStep + 1} of 5</span>
          </div>
        </div>
        
        {renderStep()}
        
        <div className="mt-6 flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === 4}
          >
            {currentStep === 4 ? 'Submit' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 