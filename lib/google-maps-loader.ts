import { Loader } from '@googlemaps/js-api-loader';

// Create a singleton loader instance
export const googleMapsLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly',
  libraries: ['places'], // Include all needed libraries here
}); 