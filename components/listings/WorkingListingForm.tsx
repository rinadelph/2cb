import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { GoogleMap, Marker } from '@react-google-maps/api';

// Start with just the basic required fields
const listingFormSchema = z.object({
  title: z.string().min(1).max(200),
  property_type: z.enum(['residential', 'commercial', 'land']),
  listing_type: z.enum(['sale', 'rent', 'lease']),
  price: z.number().min(0).max(999999999999.99),
  formatted_address: z.string(),
  address_street_number: z.string().max(100).optional(),
  address_street_name: z.string().max(100).optional(),
  address_unit: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zip_code: z.string().max(10).optional(),
  country: z.string().max(2).default('US'),

  // Property Details
  square_feet: z.number().int().positive().nullish(),
  bedrooms: z.number().int().positive().nullish(),
  bathrooms: z.number().min(0).max(999.9).nullish(),
  year_built: z.number().int()
    .min(1800)
    .max(new Date().getFullYear() + 1)
    .nullish(),
  lot_size: z.number().positive().nullish(),
  parking_spaces: z.number().int().positive().nullish(),
  stories: z.number().int().positive().nullish(),

  // Location fields
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  location: z.any(), // We'll handle the geometry type conversion in the form submission
});

type ListingFormData = z.infer<typeof listingFormSchema>;

export function WorkingListingForm() {
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
  });

  // Load Google Maps Script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  // Initialize autocomplete
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // Initialize with null location to indicate no address selected yet
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Map center depends on selected location
  const mapCenter = useMemo(() => 
    selectedLocation ? {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng
    } : null
  , [selectedLocation]);

  // Add input ref
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Use useEffect to initialize Google Places Autocomplete
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocomplete) {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: ['us'] },
        fields: ['address_components', 'geometry', 'formatted_address'],
        types: ['address'],
      });

      setAutocomplete(autocompleteInstance);
      
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        
        if (place.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // Update coordinates and map position
          setSelectedLocation({ lat, lng });
          
          // Set form values
          setValue('formatted_address', place.formatted_address || '', { shouldValidate: true });
          setValue('latitude', lat);
          setValue('longitude', lng);
          setValue('location', {
            type: 'Point',
            coordinates: [lng, lat]
          });
          
          // Reset and update address components
          setValue('address_street_number', '');
          setValue('address_street_name', '');
          setValue('city', '');
          setValue('state', '');
          setValue('zip_code', '');
          setValue('country', 'US');
          
          // Parse address components
          place.address_components?.forEach((component) => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              setValue('address_street_number', component.long_name, { shouldValidate: true });
            }
            if (types.includes('route')) {
              setValue('address_street_name', component.long_name, { shouldValidate: true });
            }
            if (types.includes('locality')) {
              setValue('city', component.long_name, { shouldValidate: true });
            }
            if (types.includes('administrative_area_level_1')) {
              setValue('state', component.short_name, { shouldValidate: true });
            }
            if (types.includes('postal_code')) {
              setValue('zip_code', component.long_name, { shouldValidate: true });
            }
            if (types.includes('country')) {
              setValue('country', component.short_name, { shouldValidate: true });
            }
          });
        }
      });
    }
  }, [isLoaded, setValue, setAutocomplete]);

  const onSubmit = async (data: ListingFormData) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Create New Listing - Basic Information</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-white">
              Title *
            </label>
            <input
              type="text"
              {...register('title')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
              placeholder="Enter listing title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Property Type Field */}
          <div>
            <label className="block text-sm font-medium text-white">
              Property Type *
            </label>
            <select
              {...register('property_type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            >
              <option value="">Select property type</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
            </select>
            {errors.property_type && (
              <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
            )}
          </div>

          {/* Listing Type Field */}
          <div>
            <label className="block text-sm font-medium text-white">
              Listing Type *
            </label>
            <select
              {...register('listing_type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
            >
              <option value="">Select listing type</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
            </select>
            {errors.listing_type && (
              <p className="mt-1 text-sm text-red-600">{errors.listing_type.message}</p>
            )}
          </div>

          {/* Price Field */}
          <div>
            <label className="block text-sm font-medium text-white">
              Price *
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Property Address</h3>
          <div className="space-y-4">
            {/* Google Places Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-white">
                Property Address *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('formatted_address', { 
                    required: 'Property address is required'
                  })}
                  ref={(e) => {
                    inputRef.current = e; // Set our ref
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                  placeholder="Enter property address"
                />
                {errors.formatted_address && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.formatted_address.message}
                  </p>
                )}
              </div>
            </div>

            {/* Hidden address components that get populated */}
            <input type="hidden" {...register('address_street_number')} />
            <input type="hidden" {...register('address_street_name')} />
            <input type="hidden" {...register('city')} />
            <input type="hidden" {...register('state')} />
            <input type="hidden" {...register('zip_code')} />
            <input type="hidden" {...register('country')} />
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />

            {/* Optional Unit/Apt field */}
            <div>
              <label className="block text-sm font-medium text-white">
                Unit/Apt # (Optional)
              </label>
              <input
                type="text"
                {...register('address_unit')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="Apt 4B"
              />
              {errors.address_unit && (
                <p className="mt-1 text-sm text-red-600">{errors.address_unit.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Only show map preview if location is selected */}
        {selectedLocation && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Location Preview</h3>
            
            {/* Map Container */}
            <div className="mb-4">
              {isLoaded ? (
                <GoogleMap
                  mapContainerClassName="w-full h-[300px] rounded-lg"
                  center={selectedLocation}
                  zoom={16}
                  options={{
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                  }}
                >
                  <Marker 
                    position={selectedLocation}
                    animation={google.maps.Animation.DROP}
                  />
                </GoogleMap>
              ) : (
                <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Loading map...</span>
                </div>
              )}
            </div>

            {/* Coordinates Display */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-white">
                  Latitude
                </label>
                <input
                  type="text"
                  value={selectedLocation.lat.toFixed(8)}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white">
                  Longitude
                </label>
                <input
                  type="text"
                  value={selectedLocation.lng.toFixed(8)}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-black"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Square Feet */}
            <div>
              <label className="block text-sm font-medium text-white">
                Square Feet
              </label>
              <input
                type="number"
                {...register('square_feet', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="0"
              />
              {errors.square_feet && (
                <p className="mt-1 text-sm text-red-600">{errors.square_feet.message}</p>
              )}
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-white">
                Bedrooms
              </label>
              <input
                type="number"
                {...register('bedrooms', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="0"
              />
              {errors.bedrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
              )}
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-white">
                Bathrooms
              </label>
              <input
                type="number"
                step="0.1"
                {...register('bathrooms', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="0.0"
              />
              {errors.bathrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
              )}
            </div>

            {/* Year Built */}
            <div>
              <label className="block text-sm font-medium text-white">
                Year Built
              </label>
              <input
                type="number"
                {...register('year_built', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder={new Date().getFullYear().toString()}
                min="1800"
                max={new Date().getFullYear() + 1}
              />
              {errors.year_built && (
                <p className="mt-1 text-sm text-red-600">{errors.year_built.message}</p>
              )}
            </div>

            {/* Lot Size */}
            <div>
              <label className="block text-sm font-medium text-white">
                Lot Size (sq ft)
              </label>
              <input
                type="number"
                step="0.01"
                {...register('lot_size', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="0.00"
              />
              {errors.lot_size && (
                <p className="mt-1 text-sm text-red-600">{errors.lot_size.message}</p>
              )}
            </div>

            {/* Parking Spaces */}
            <div>
              <label className="block text-sm font-medium text-white">
                Parking Spaces
              </label>
              <input
                type="number"
                {...register('parking_spaces', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="0"
              />
              {errors.parking_spaces && (
                <p className="mt-1 text-sm text-red-600">{errors.parking_spaces.message}</p>
              )}
            </div>

            {/* Stories */}
            <div>
              <label className="block text-sm font-medium text-white">
                Stories
              </label>
              <input
                type="number"
                {...register('stories', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                placeholder="0"
              />
              {errors.stories && (
                <p className="mt-1 text-sm text-red-600">{errors.stories.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue
          </button>
        </div>
      </div>
    </form>
  );
} 