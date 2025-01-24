"use client"

import * as React from "react"
import { UseFormReturn } from 'react-hook-form';
import { ListingFormValues } from '@/schemas/listing';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { HiPlus, HiMinus, HiHome, HiBuildingOffice2, HiCalendar } from 'react-icons/hi2';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface PropertyDetailsStepProps {
  form: UseFormReturn<ListingFormValues>;
  onNext: () => void;
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

function NumberInput({ value, onChange, min = 0, max = 100, step = 1, disabled }: NumberInputProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={disabled || value <= min}
      >
        <HiMinus className="h-4 w-4" />
      </Button>
      <div className="w-16 text-center font-medium">{value}</div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={disabled || value >= max}
      >
        <HiPlus className="h-4 w-4" />
      </Button>
    </div>
  );
}

const COMMON_SIZES = [
  { label: '1,000', value: 1000 },
  { label: '1,500', value: 1500 },
  { label: '2,000', value: 2000 },
  { label: '2,500', value: 2500 },
  { label: '3,000', value: 3000 },
];

export function PropertyDetailsStep({ form, onNext }: PropertyDetailsStepProps) {
  const { setValue, watch } = form;
  const [isCustomSize, setIsCustomSize] = useState(false);
  const squareFeet = watch('square_feet') || 0;
  const bedrooms = watch('bedrooms') || 0;
  const bathrooms = watch('bathrooms') || 0;
  const yearBuilt = watch('year_built') || new Date().getFullYear();
  const stories = watch('stories') || 1;

  const handleSquareFootageChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(cleanValue, 10) || 0;
    
    const limitedValue = Math.min(numValue, 100_000_000);
    
    setValue('square_feet', limitedValue);
    setIsCustomSize(true);
  };

  const formatSquareFootage = (value: number): string => {
    return value.toLocaleString();
  };

  const handleSliderChange = (value: number) => {
    setValue('square_feet', value);
    setIsCustomSize(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HiHome className="h-5 w-5 text-muted-foreground" />
            <Label className="text-lg font-medium">Square Footage</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              className="w-36 text-right"
              value={formatSquareFootage(squareFeet)}
              onChange={(e) => handleSquareFootageChange(e.target.value)}
              onFocus={() => setIsCustomSize(true)}
            />
            <span className="text-sm text-muted-foreground">sq ft</span>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <Slider
              value={[squareFeet]}
              onValueChange={([value]) => handleSliderChange(value)}
              max={10000}
              step={100}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>2,500</span>
              <span>5,000</span>
              <span>7,500</span>
              <span>10,000+</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_SIZES.map(({ label, value }) => (
              <Button
                key={value}
                variant={squareFeet === value && !isCustomSize ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setValue('square_feet', value);
                  setIsCustomSize(false);
                }}
                className="flex-1 transition-all"
              >
                {value.toLocaleString()}
                <span className="ml-1 text-xs text-muted-foreground">sq ft</span>
              </Button>
            ))}
            <Button
              variant={isCustomSize ? "default" : "outline"}
              size="sm"
              onClick={() => setIsCustomSize(true)}
              className="flex-1 transition-all"
            >
              Custom
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <HiBuildingOffice2 className="h-5 w-5 text-muted-foreground" />
              <Label className="text-lg font-medium">Layout</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Bedrooms</Label>
                <NumberInput
                  value={bedrooms}
                  onChange={(value) => setValue('bedrooms', value)}
                  max={10}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Bathrooms</Label>
                <NumberInput
                  value={bathrooms}
                  onChange={(value) => setValue('bathrooms', value)}
                  max={10}
                  step={0.5}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <HiCalendar className="h-5 w-5 text-muted-foreground" />
              <Label className="text-lg font-medium">Building Details</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Year Built</Label>
                <NumberInput
                  value={yearBuilt}
                  onChange={(value) => setValue('year_built', value)}
                  min={1800}
                  max={new Date().getFullYear()}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Stories</Label>
                <NumberInput
                  value={stories}
                  onChange={(value) => setValue('stories', value)}
                  min={1}
                  max={100}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Property Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Size</div>
              <div className="font-medium">
                {formatSquareFootage(squareFeet)} sq ft
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Layout</div>
              <div className="font-medium">{bedrooms} bed, {bathrooms} bath</div>
            </div>
            <div>
              <div className="text-muted-foreground">Built</div>
              <div className="font-medium">{yearBuilt}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Stories</div>
              <div className="font-medium">{stories}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 