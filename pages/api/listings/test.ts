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
      user_id: user.id, // Use authenticated user's ID
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
      address: {
        street_number: '123',
        street_name: 'Test Street',
        city: 'Test City',
        state: 'FL',
        zip: '33133',
        country: 'US'
      },
      location: {
        lat: 25.7617,
        lng: -80.1918
      },
      features: ['Pool', 'Garage', 'Central AC'],
      amenities: ['Gym', 'Pool', 'Tennis Court'],
      images: [],
      documents: [],
      meta_data: {
        is_test: true,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
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
  } catch (error: any) {
    console.error('Error creating test listing:', {
      error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return res.status(500).json({ 
      error: 'Failed to create test listing',
      details: error.message
    });
  }
} 