import 'dotenv/config';
import { supabase } from '../src/lib/supabase/client';
import { geocodeAddress } from '../src/lib/utils/geocoding';

async function geocodeExistingListings() {
  // Verify environment variables
  const envVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleMapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  };

  console.log('Environment check:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}: ${value ? 'Present' : 'Missing'}`);
    if (!value) throw new Error(`Missing environment variable: ${key}`);
  });

  console.log('\nFetching listings with null coordinates...');
  
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .or('latitude.is.null,longitude.is.null');

  if (error) {
    console.error('Error fetching listings:', error);
    return;
  }

  if (!listings?.length) {
    console.log('No listings found that need geocoding');
    return;
  }

  console.log(`Found ${listings.length} listings to geocode`);

  for (const listing of listings) {
    console.log(`\nProcessing listing ${listing.id}`);
    const address = `${listing.address_street_number} ${listing.address_street_name}, ${listing.city}, ${listing.state} ${listing.zip_code}`;
    console.log('Address:', address);
    
    try {
      const geoData = await geocodeAddress(listing);
      
      if (geoData) {
        console.log('Geocoding successful:', geoData);
        
        const updateData = {
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          location: `SRID=4326;POINT(${geoData.longitude} ${geoData.latitude})`
        };

        console.log('Updating Supabase with:', updateData);

        const { error: updateError } = await supabase
          .from('listings')
          .update(updateData)
          .eq('id', listing.id);

        if (updateError) {
          console.error(`Failed to update listing ${listing.id}:`, updateError);
        } else {
          console.log(`Successfully updated listing ${listing.id}`);
          
          // Verify the update
          const { data: verifyData, error: verifyError } = await supabase
            .from('listings')
            .select('id, latitude, longitude, location')
            .eq('id', listing.id)
            .single();
            
          if (verifyError) {
            console.error('Failed to verify update:', verifyError);
          } else {
            console.log('Verified data in database:', verifyData);
          }
        }
      } else {
        console.error(`Failed to geocode listing ${listing.id} - no coordinates returned`);
      }
    } catch (error) {
      console.error(`Error processing listing ${listing.id}:`, error);
    }

    // Add delay to avoid hitting API rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Run the script
geocodeExistingListings().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 