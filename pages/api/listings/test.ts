import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ListingFormValues } from '@/lib/schemas/listing-schema';

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // This is different from the anon key
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.body;
    if (!user_id) {
      throw new Error('User ID is required');
    }

    // Create test listing data
    const testData = {
      user_id,
      title: "Test Luxury Waterfront Villa",
      description: "A stunning waterfront property perfect for luxury living. This test listing showcases all features of our platform.",
      mls_number: "TEST" + Math.floor(Math.random() * 10000),
      status: "draft",
      address: "123 Test Beach Road",
      city: "Miami Beach",
      state: "FL",
      zip_code: "33139",
      county: "Miami-Dade",
      property_type: "single_family" as const,
      year_built: "2020",
      bedrooms: 5,
      bathrooms_full: 4,
      bathrooms_half: 1,
      square_feet_living: 4500,
      square_feet_total: 6000,
      lot_size_sf: 10000,
      garage_spaces: 2,
      carport_spaces: 0,
      furnished: true,
      pool: true,
      waterfront: true,
      water_access: true,
      price: 2500000,
      tax_amount: 25000,
      tax_year: "2023",
      maintenance_fee: 0,
      special_assessment: false,
      virtual_tour_url: "https://example.com/tour",
      broker_remarks: "Test listing for demonstration purposes",
      showing_instructions: "Contact agent for showing",
      listing_office: "Test Luxury Realty",
      listing_agent_name: "Test Agent",
      listing_agent_phone: "(305) 555-0123",
      listing_agent_email: "test@example.com",
      listing_agent_license: "TEST12345"
    };

    // Create main listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert([testData])
      .select()
      .single();

    if (listingError) {
      console.error('Supabase error:', listingError);
      throw listingError;
    }

    if (listing) {
      // Create listing features
      const { error: featuresError } = await supabase
        .from('listing_features')
        .insert([{
          listing_id: listing.id,
          construction_type: ["CBS", "Impact Windows"],
          interior_features: ["Smart Home", "Wine Cellar", "Chef's Kitchen"],
          exterior_features: ["Pool", "Summer Kitchen", "Dock"],
          parking_description: ["2 Car Garage", "Circular Driveway"],
          lot_description: ["Waterfront", "Gated", "Landscaped"]
        }]);

      if (featuresError) throw featuresError;

      // Create listing images
      const testImages = [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811"
      ];

      const imageInserts = testImages.map((url, index) => ({
        listing_id: listing.id,
        url,
        position: index
      }));

      const { error: imagesError } = await supabase
        .from('listing_images')
        .insert(imageInserts);

      if (imagesError) throw imagesError;
    }

    return res.status(200).json({ success: true, listing });
  } catch (error) {
    console.error('Error creating test listing:', error);
    return res.status(500).json({ 
      error: 'Failed to create test listing', 
      details: error instanceof Error ? error.message : 'Unknown error',
      data: req.body
    });
  }
} 