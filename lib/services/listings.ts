import { supabase } from "@/lib/supabase-client";
import { ListingFormValues } from "@/lib/schemas/listing-schema";

// Add sample gallery images
const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?q=80&w=2053&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
];

// Update the test data to match the schema
export const TEST_LISTING_DATA: Partial<ListingFormValues> = {
  title: "Luxury Test Property in Miami Beach",
  description: "Beautiful test property with amazing views",
  mls_number: "TEST123456",
  status: "draft",
  address_street: "1234 Test Beach Drive",
  address_unit: "PH-1",
  city: "Miami Beach",
  state: "FL",
  zip_code: "33139",
  county: "Miami-Dade",
  folio_number: "01-1234-567-8910",
  parcel_number: "12345",
  legal_description: "Test Legal Description",
  property_type: "single_family",
  year_built: "2020",
  bedrooms: "4",
  bathrooms_full: "3",
  bathrooms_half: "1",
  square_feet_living: "3500",
  square_feet_total: "4000",
  lot_size_sf: "7500",
  garage_spaces: "2",
  carport_spaces: "0",
  furnished: true,
  pool: true,
  waterfront: true,
  water_access: true,
  construction_type: ["concrete_block"],
  interior_features: ["Walk-in Closets", "Built-ins", "Smart Home"],
  exterior_features: ["Pool", "Patio", "Summer Kitchen"],
  parking_description: ["2 Car Garage", "Circular Driveway"],
  lot_description: ["Corner Lot", "Gated Community"],
  price: "2500000",
  tax_amount: "25000",
  tax_year: "2024",
  maintenance_fee: "1000",
  special_assessment: false,
  images: SAMPLE_IMAGES,
  virtual_tour_url: "https://example.com/tour",
  broker_remarks: "Test broker remarks",
  showing_instructions: "Call for appointment",
  listing_office: "Test Realty Group",
  listing_agent_name: "John Test",
  listing_agent_phone: "305-555-1234",
  listing_agent_email: "test@example.com",
  listing_agent_license: "TEST123"
};

// Add function to save test listing locally
export function saveTestListingLocally(userId: string) {
  try {
    const listingId = `test-${Date.now()}`;
    const listing = {
      id: listingId,
      ...TEST_LISTING_DATA,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: SAMPLE_IMAGES,
      features: {
        interior: TEST_LISTING_DATA.interior_features || [],
        exterior: TEST_LISTING_DATA.exterior_features || [],
        construction: TEST_LISTING_DATA.construction_type || [],
        parking: TEST_LISTING_DATA.parking_description || [],
        lot: TEST_LISTING_DATA.lot_description || []
      },
      metadata: {
        submission_date: new Date().toISOString(),
        last_edited: new Date().toISOString(),
        status_history: [{
          status: TEST_LISTING_DATA.status || 'draft',
          timestamp: new Date().toISOString()
        }]
      }
    };

    // Save to localStorage
    const existingListings = JSON.parse(localStorage.getItem('test_listings') || '[]');
    const updatedListings = [...existingListings, listing];
    localStorage.setItem('test_listings', JSON.stringify(updatedListings));

    console.log('Saved test listing:', listing);
    console.log('All listings:', updatedListings);

    return { listing, error: null };
  } catch (error) {
    console.error('Error saving test listing:', error);
    return { 
      listing: null, 
      error: error instanceof Error ? error : new Error('Failed to save test listing')
    };
  }
}

// Add function to get test listings with better logging
export function getTestListings(userId: string) {
  try {
    const listings = JSON.parse(localStorage.getItem('test_listings') || '[]');
    const userListings = listings.filter((listing: any) => listing.user_id === userId);
    console.log('Getting test listings for user:', userId);
    console.log('Found listings:', userListings);
    return userListings;
  } catch (error) {
    console.error('Error getting test listings:', error);
    return [];
  }
}

export async function createListing(data: Partial<ListingFormValues>, userId: string) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Format the data for database insertion
    const listingData = {
      ...data,
      user_id: userId, // Use the passed userId directly
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: data.status || 'draft',
      property_type: data.property_type || 'single_family',
      features: {
        interior: data.interior_features || [],
        exterior: data.exterior_features || [],
        construction: data.construction_type || [],
        parking: data.parking_description || [],
        lot: data.lot_description || []
      },
      metadata: {
        submission_date: new Date().toISOString(),
        last_edited: new Date().toISOString(),
        status_history: [{
          status: data.status || 'draft',
          timestamp: new Date().toISOString()
        }]
      }
    };

    // Remove fields that are stored in features/metadata
    const cleanedData = {
      ...listingData,
      interior_features: undefined,
      exterior_features: undefined,
      construction_type: undefined,
      parking_description: undefined,
      lot_description: undefined
    };

    console.log('Creating listing with data:', cleanedData);

    // Insert the listing
    const { data: listing, error } = await supabase
      .from('listings')
      .insert([cleanedData])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    if (!listing) {
      throw new Error('No listing returned from database');
    }

    return { listing, error: null };
  } catch (error) {
    console.error('Error details:', error);
    return { 
      listing: null, 
      error: error instanceof Error ? error : new Error('Failed to create listing')
    };
  }
}

export async function uploadListingImages(files: File[], listingId: string) {
  try {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${listingId}/${Math.random()}.${fileExt}`;
      const filePath = `listings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return { urls: uploadedUrls, error: null };
  } catch (error) {
    console.error('Error uploading images:', error);
    return { 
      urls: [], 
      error: error instanceof Error ? error : new Error('Failed to upload images')
    };
  }
}

export async function updateListingStatus(
  listingId: string, 
  status: ListingFormValues['status'],
  userId: string
) {
  try {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'active' && { published_at: new Date().toISOString() }),
      ...(status === 'sold' && { sold_at: new Date().toISOString() }),
      metadata: {
        last_edited: new Date().toISOString(),
        status_history: supabase.sql`array_append(metadata->'status_history', jsonb_build_object(
          'status', ${status},
          'timestamp', ${new Date().toISOString()}
        ))`
      }
    };

    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating listing status:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Failed to update listing status')
    };
  }
} 