import React, { useRef, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ListingFormValues } from '@/schemas/listing';
import { CustomInput } from '@/components/ui/custom-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { HiLocationMarker, HiSearch } from 'react-icons/hi';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { MapPreview } from './MapPreview';

interface LocationStepProps {
  form: UseFormReturn<ListingFormValues>;
  onNext: () => void;
}

export function LocationStep({ form, onNext }: LocationStepProps) {
  const { register, formState: { errors }, setValue, watch } = form;
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue: setAddressValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'us' },
      types: ['address']
    },
    debounce: 300,
  });

  const handleAddressSelect = async (address: string) => {
    setIsLoading(true);
    setError(null);
    setAddressValue(address, false);
    clearSuggestions();
    setShowSuggestions(false);

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      // Parse address components
      const addressComponents = results[0].address_components;
      const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name || '';
      const streetName = addressComponents.find(c => c.types.includes('route'))?.long_name || '';
      const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '';
      const zipCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';

      // Update form values
      setValue('address_street_number', streetNumber);
      setValue('address_street_name', streetName);
      setValue('city', city);
      setValue('state', state);
      setValue('zip_code', zipCode);
      setValue('location', {
        type: 'Point',
        coordinates: [lng, lat],
        lat,
        lng
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error geocoding address:', error);
      setError('Failed to get address details. Please try again.');
      setIsLoading(false);
    }
  };

  const location = watch('location');
  const hasLocation = location?.lat && location?.lng;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || status !== "OK") return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < data.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleAddressSelect(data[selectedIndex].description);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Property Address</Label>
        <div className="relative" ref={wrapperRef}>
          <div className="relative">
            <HiSearch className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
              isLoading ? "animate-spin text-primary" : "text-muted-foreground"
            )} />
            <input
              type="text"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
              placeholder="Search address..."
              value={value}
              onChange={(e) => {
                setAddressValue(e.target.value);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              disabled={!ready}
            />
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => {
                  setAddressValue("");
                  clearSuggestions();
                }}
              >
                ×
              </Button>
            )}
          </div>
          
          {status === "OK" && showSuggestions && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-input bg-popover shadow-md">
              <div className="overflow-hidden p-1">
                {data.map(({ place_id, description }, index) => (
                  <div
                    key={place_id}
                    className={cn(
                      "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      selectedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => handleAddressSelect(description)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <HiLocationMarker className="mr-2 h-4 w-4" />
                    {description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address_street_number">Street Number</Label>
          <CustomInput
            id="address_street_number"
            {...register('address_street_number')}
            error={errors.address_street_number?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address_street_name">Street Name</Label>
          <CustomInput
            id="address_street_name"
            {...register('address_street_name')}
            error={errors.address_street_name?.message}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_unit">Unit/Apt (Optional)</Label>
        <CustomInput
          id="address_unit"
          {...register('address_unit')}
          error={errors.address_unit?.message}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <CustomInput
            id="city"
            {...register('city')}
            error={errors.city?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <CustomInput
            id="state"
            {...register('state')}
            error={errors.state?.message}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip_code">ZIP Code</Label>
          <CustomInput
            id="zip_code"
            {...register('zip_code')}
            error={errors.zip_code?.message}
          />
        </div>
      </div>

      {hasLocation && (
        <div className="space-y-4">
          <Label>Location Preview</Label>
          <MapPreview 
            center={{ 
              lat: location.lat, 
              lng: location.lng 
            }} 
          />
        </div>
      )}
    </div>
  );
} 