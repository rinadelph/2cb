import { supabase } from "@/lib/supabase-client";
import { ListingFormValues } from "@/lib/schemas/listing-schema";
import { ListingResponse } from "@/types/listing";

export async function getListing(id: string): Promise<ListingResponse> {
  try {
    // Get main listing data
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (listingError) throw listingError;

    // Get listing features
    const { data: features, error: featuresError } = await supabase
      .from('listing_features')
      .select('*')
      .eq('listing_id', id)
      .single();

    if (featuresError) throw featuresError;

    // Get listing images
    const { data: images, error: imagesError } = await supabase
      .from('listing_images')
      .select('*')
      .eq('listing_id', id)
      .order('position');

    if (imagesError) throw imagesError;

    // Convert numeric fields
    const formattedListing: ListingFormValues = {
      ...listing,
      price: Number(listing.price) || 0,
      tax_amount: listing.tax_amount ? Number(listing.tax_amount) : undefined,
      maintenance_fee: listing.maintenance_fee ? Number(listing.maintenance_fee) : undefined,
      square_feet_living: listing.square_feet_living ? Number(listing.square_feet_living) : undefined,
      square_feet_total: listing.square_feet_total ? Number(listing.square_feet_total) : undefined,
      lot_size_sf: listing.lot_size_sf ? Number(listing.lot_size_sf) : undefined,
      bedrooms: listing.bedrooms ? Number(listing.bedrooms) : undefined,
      bathrooms_full: listing.bathrooms_full ? Number(listing.bathrooms_full) : undefined,
      bathrooms_half: listing.bathrooms_half ? Number(listing.bathrooms_half) : undefined,
      garage_spaces: listing.garage_spaces ? Number(listing.garage_spaces) : undefined,
      carport_spaces: listing.carport_spaces ? Number(listing.carport_spaces) : undefined,
      construction_type: features?.construction_type || [],
      interior_features: features?.interior_features || [],
      exterior_features: features?.exterior_features || [],
      parking_description: features?.parking_description || [],
      lot_description: features?.lot_description || [],
      images: images?.map(img => img.url) || []
    } as ListingFormValues;

    return { listing: formattedListing, error: null };
  } catch (error) {
    console.error('Error getting listing:', error);
    return {
      listing: null,
      error: error instanceof Error ? error : new Error('Failed to get listing')
    };
  }
}

export async function updateListing(id: string, data: Partial<ListingFormValues>, userId: string): Promise<ListingResponse> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Convert numeric fields to strings for database storage
    const formattedData = {
      ...data,
      price: data.price?.toString(),
      tax_amount: data.tax_amount?.toString(),
      maintenance_fee: data.maintenance_fee?.toString(),
      square_feet_living: data.square_feet_living?.toString(),
      square_feet_total: data.square_feet_total?.toString(),
      lot_size_sf: data.lot_size_sf?.toString(),
      bedrooms: data.bedrooms?.toString(),
      bathrooms_full: data.bathrooms_full?.toString(),
      bathrooms_half: data.bathrooms_half?.toString(),
      garage_spaces: data.garage_spaces?.toString(),
      carport_spaces: data.carport_spaces?.toString(),
    };

    // Update main listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .update(formattedData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (listingError) throw listingError;

    if (listing) {
      // Update listing features
      const { error: featuresError } = await supabase
        .from('listing_features')
        .upsert({
          listing_id: id,
          construction_type: data.construction_type || [],
          interior_features: data.interior_features || [],
          exterior_features: data.exterior_features || [],
          parking_description: data.parking_description || [],
          lot_description: data.lot_description || []
        });

      if (featuresError) throw featuresError;

      // Update listing images
      if (data.images) {
        // Delete existing images
        await supabase
          .from('listing_images')
          .delete()
          .eq('listing_id', id);

        // Insert new images
        const imageInserts = data.images.map((url, index) => ({
          listing_id: id,
          url,
          position: index
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imageInserts);

        if (imagesError) throw imagesError;
      }
    }

    return { 
      listing: {
        ...listing,
        price: Number(listing.price) || 0,
        tax_amount: listing.tax_amount ? Number(listing.tax_amount) : undefined,
        maintenance_fee: listing.maintenance_fee ? Number(listing.maintenance_fee) : undefined,
        square_feet_living: listing.square_feet_living ? Number(listing.square_feet_living) : undefined,
        square_feet_total: listing.square_feet_total ? Number(listing.square_feet_total) : undefined,
        lot_size_sf: listing.lot_size_sf ? Number(listing.lot_size_sf) : undefined,
        bedrooms: listing.bedrooms ? Number(listing.bedrooms) : undefined,
        bathrooms_full: listing.bathrooms_full ? Number(listing.bathrooms_full) : undefined,
        bathrooms_half: listing.bathrooms_half ? Number(listing.bathrooms_half) : undefined,
        garage_spaces: listing.garage_spaces ? Number(listing.garage_spaces) : undefined,
        carport_spaces: listing.carport_spaces ? Number(listing.carport_spaces) : undefined,
      } as ListingFormValues, 
      error: null 
    };
  } catch (error) {
    console.error('Error updating listing:', error);
    return {
      listing: null,
      error: error instanceof Error ? error : new Error('Failed to update listing')
    };
  }
}

export const getTestListings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        listing_features (*),
        listing_images (*)
      `)
      .eq('user_id', userId)
      .ilike('mls_number', 'TEST%')  // Filter for test listings by MLS number prefix
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching test listings:', error);
      throw error;
    }

    // Format the listings to match the expected structure
    const formattedListings = data?.map(listing => ({
      ...listing,
      price: Number(listing.price) || 0,
      tax_amount: listing.tax_amount ? Number(listing.tax_amount) : undefined,
      maintenance_fee: listing.maintenance_fee ? Number(listing.maintenance_fee) : undefined,
      square_feet_living: listing.square_feet_living ? Number(listing.square_feet_living) : undefined,
      square_feet_total: listing.square_feet_total ? Number(listing.square_feet_total) : undefined,
      lot_size_sf: listing.lot_size_sf ? Number(listing.lot_size_sf) : undefined,
      bedrooms: listing.bedrooms ? Number(listing.bedrooms) : undefined,
      bathrooms_full: listing.bathrooms_full ? Number(listing.bathrooms_full) : undefined,
      bathrooms_half: listing.bathrooms_half ? Number(listing.bathrooms_half) : undefined,
      garage_spaces: listing.garage_spaces ? Number(listing.garage_spaces) : undefined,
      carport_spaces: listing.carport_spaces ? Number(listing.carport_spaces) : undefined,
      images: listing.listing_images?.map((img: { url: string }) => img.url) || []
    })) || [];

    return formattedListings;
  } catch (error) {
    console.error('Error in getTestListings:', error);
    return [];
  }
};

export async function createListing(data: ListingFormValues, userId: string): Promise<ListingResponse> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Convert numeric fields to strings for database storage
    const formattedData = {
      ...data,
      user_id: userId,
      price: data.price.toString(),
      tax_amount: data.tax_amount?.toString(),
      maintenance_fee: data.maintenance_fee?.toString(),
      square_feet_living: data.square_feet_living?.toString(),
      square_feet_total: data.square_feet_total?.toString(),
      lot_size_sf: data.lot_size_sf?.toString(),
      bedrooms: data.bedrooms?.toString(),
      bathrooms_full: data.bathrooms_full?.toString(),
      bathrooms_half: data.bathrooms_half?.toString(),
      garage_spaces: data.garage_spaces?.toString(),
      carport_spaces: data.carport_spaces?.toString(),
    };

    // Create main listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert([formattedData])
      .select()
      .single();

    if (listingError) throw listingError;

    if (listing) {
      // Create listing features
      const { error: featuresError } = await supabase
        .from('listing_features')
        .insert([{
          listing_id: listing.id,
          construction_type: data.construction_type,
          interior_features: data.interior_features,
          exterior_features: data.exterior_features,
          parking_description: data.parking_description,
          lot_description: data.lot_description
        }]);

      if (featuresError) throw featuresError;

      // Create listing images
      if (data.images && data.images.length > 0) {
        const imageInserts = data.images.map((url, index) => ({
          listing_id: listing.id,
          url,
          position: index
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imageInserts);

        if (imagesError) throw imagesError;
      }
    }

    return { 
      listing: {
        ...listing,
        price: Number(listing.price) || 0,
        bedrooms: Number(listing.bedrooms) || 0,
      } as ListingFormValues, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating listing:', error);
    return {
      listing: null,
      error: error instanceof Error ? error : new Error('Failed to create listing')
    };
  }
}

export async function createTestListing(userId: string): Promise<ListingResponse> {
  const testData: ListingFormValues = {
    title: "Test Luxury Waterfront Villa",
    description: "A stunning waterfront property perfect for luxury living. This test listing showcases all features of our platform.",
    mls_number: "TEST" + Math.floor(Math.random() * 10000),
    status: "draft",
    address: "123 Test Beach Road",
    city: "Miami Beach",
    state: "FL",
    zip_code: "33139",
    county: "Miami-Dade",
    property_type: "single_family",
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
    construction_type: ["CBS", "Impact Windows"],
    interior_features: ["Smart Home", "Wine Cellar", "Chef's Kitchen"],
    exterior_features: ["Pool", "Summer Kitchen", "Dock"],
    parking_description: ["2 Car Garage", "Circular Driveway"],
    lot_description: ["Waterfront", "Gated", "Landscaped"],
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
    listing_agent_license: "TEST12345",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811"
    ]
  };

  return createListing(testData, userId);
} 