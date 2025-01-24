import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { ListingBase } from '@/types/listing';
import { getAuthUser } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow test listings in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Test listings are not allowed in production' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ 
        message: 'Unauthorized',
        details: 'You must be logged in to create a test listing'
      });
    }

    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Unauthorized',
        details: 'Missing or invalid authorization header'
      });
    }

    // Create a test listing
    const testListing: Partial<ListingBase> = {
      user_id: user.id,
      title: `Test Listing ${new Date().toISOString()}`,
      description: 'This is a test listing created automatically',
      status: 'draft',
      property_type: 'single_family',
      listing_type: 'sale',
      price: 500000,
      square_feet: 2500,
      bedrooms: 4,
      bathrooms: 2.5,
      year_built: 2020,
      lot_size: 0.25,
      parking_spaces: 2,
      stories: 2,
      address_street_number: '123',
      address_street_name: 'Test Street',
      address: '123 Test Street',
      city: 'Test City',
      state: 'FL',
      zip_code: '33133',
      country: 'US',
      location: {
        type: 'Point',
        coordinates: [-80.1918, 25.7617],
        lat: 25.7617,
        lng: -80.1918
      },
      features: {
        construction_type: ['CBS'],
        interior_features: ['Central AC', 'Tile Floors'],
        exterior_features: ['Pool', 'Garage']
      },
      amenities: {
        pool: true,
        waterfront: false,
        furnished: false
      },
      listing_office: 'Test Office',
      listing_agent_name: 'Test Agent',
      listing_agent_phone: '555-555-5555',
      listing_agent_email: 'test@example.com',
      listing_agent_license: 'FL123456',
      mls_number: `TEST${Date.now()}`
    };

    // Use test context for Supabase client
    const supabase = getSupabaseClient('test');
    const { data: listing, error } = await supabase
      .from('listings')
      .insert([testListing])
      .select()
      .single();

    if (error) {
      console.error('Error creating test listing:', {
        error,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error('Error creating test listing:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({ 
      error: 'Failed to create test listing',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 