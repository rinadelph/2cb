import { supabase } from "@/lib/supabase-client";
import { ListingFormValues } from "@/lib/schemas/listing-schema";
import { ListingBase, ListingImage } from "@/types/listing";
import { 
  ListingStatus, 
  PropertyType, 
  ListingType,
  CommissionType,
  CommissionStatus,
  CommissionVisibility,
  GeoLocation 
} from "@/types/core";
import { CommissionStructure } from '@/types/commission';

interface ListingResponse {
  listing: ListingBase | null;
  error: Error | null;
}

const mapStatus = (status: string): ListingStatus => {
  switch (status) {
    case 'archived':
      return 'inactive';
    case 'draft':
    case 'pending':
    case 'active':
    case 'inactive':
    case 'expired':
    case 'sold':
      return status as ListingStatus;
    default:
      return 'draft';
  }
};

const formatListing = (listing: any): ListingBase => ({
  id: listing.id,
  user_id: listing.user_id,
  organization_id: listing.organization_id,
  title: listing.title,
  slug: listing.slug || '',
  description: listing.description || '',
  status: mapStatus(listing.status),
  property_type: listing.property_type,
  listing_type: listing.listing_type || 'sale' as ListingType,
  price: Number(listing.price) || 0,

  // Address fields (flat structure)
  address_street_number: listing.address_street_number || '',
  address_street_name: listing.address_street_name || '',
  address_unit: listing.address_unit,
  city: listing.city || '',
  state: listing.state || '',
  zip_code: listing.zip_code || '',
  country: listing.country || 'US',

  // Location fields
  latitude: listing.latitude ? Number(listing.latitude) : undefined,
  longitude: listing.longitude ? Number(listing.longitude) : undefined,
  location: listing.location?.type === 'Point' ? {
    lat: listing.location.coordinates[1],
    lng: listing.location.coordinates[0]
  } : undefined,

  // Property details
  square_feet: listing.square_feet ? Number(listing.square_feet) : undefined,
  bedrooms: listing.bedrooms ? Number(listing.bedrooms) : undefined,
  bathrooms: listing.bathrooms ? Number(listing.bathrooms) : undefined,
  year_built: listing.year_built ? Number(listing.year_built) : undefined,
  lot_size: listing.lot_size ? Number(listing.lot_size) : undefined,
  parking_spaces: listing.parking_spaces ? Number(listing.parking_spaces) : undefined,
  stories: listing.stories ? Number(listing.stories) : undefined,

  // JSON fields
  features: listing.features || {},
  amenities: listing.amenities || {},
  images: (listing.images || []).map((image: any) => ({
    id: image.id || crypto.randomUUID(),
    url: image.url,
    width: Number(image.width) || 0,
    height: Number(image.height) || 0,
    size: Number(image.size) || 0,
    type: image.type || 'image/jpeg',
    is_featured: Boolean(image.is_featured),
    order: Number(image.order) || 0,
    meta_data: image.meta_data || {}
  })),
  documents: listing.documents || [],
  meta_data: listing.meta_data || {},

  // Commission fields
  commission_amount: listing.commission_amount ? Number(listing.commission_amount) : undefined,
  commission_type: listing.commission_type,
  commission_terms: listing.commission_terms,
  commission_status: listing.commission_status || 'draft',
  commission_visibility: listing.commission_visibility || 'private',
  commission_signature_data: listing.commission_signature_data,
  commission_signed_at: listing.commission_signed_at,
  commission_signed_by: listing.commission_signed_by,
  commission_locked_at: listing.commission_locked_at,
  commission_locked_by: listing.commission_locked_by,

  // Timestamps
  created_at: listing.created_at,
  updated_at: listing.updated_at,
  published_at: listing.published_at,
  expires_at: listing.expires_at
});

const formatFormData = (data: ListingFormValues, userId: string) => {
  const [streetNumber, ...streetNameParts] = data.address.split(' ');
  const streetName = streetNameParts.join(' ');

  return {
    user_id: userId,
    title: data.title,
    description: data.description,
    status: mapStatus(data.status),
    property_type: data.property_type,
    listing_type: 'sale' as ListingType,
    price: data.price,
    address_street_number: streetNumber,
    address_street_name: streetName,
    address_unit: data.address_unit,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code,
    county: data.county,
    folio_number: data.folio_number,
    parcel_number: data.parcel_number,
    legal_description: data.legal_description,
    year_built: data.year_built,
    bedrooms: data.bedrooms,
    bathrooms_full: data.bathrooms_full,
    bathrooms_half: data.bathrooms_half,
    square_feet_living: data.square_feet_living,
    square_feet_total: data.square_feet_total,
    lot_size_sf: data.lot_size_sf,
    garage_spaces: data.garage_spaces,
    carport_spaces: data.carport_spaces,
    features: [
      ...(data.construction_type || []),
      ...(data.interior_features || []),
      ...(data.exterior_features || [])
    ],
    amenities: [
      ...(data.parking_description || []),
      ...(data.lot_description || [])
    ],
    images: data.images,
    meta_data: {
      furnished: data.furnished,
      pool: data.pool,
      waterfront: data.waterfront,
      water_access: data.water_access,
      tax_amount: data.tax_amount,
      tax_year: data.tax_year,
      maintenance_fee: data.maintenance_fee,
      special_assessment: data.special_assessment,
      virtual_tour_url: data.virtual_tour_url,
      broker_remarks: data.broker_remarks,
      showing_instructions: data.showing_instructions,
      listing_office: data.listing_office,
      listing_agent_name: data.listing_agent_name,
      listing_agent_phone: data.listing_agent_phone,
      listing_agent_email: data.listing_agent_email,
      listing_agent_license: data.listing_agent_license
    }
  };
};

export async function getListing(id: string): Promise<ListingResponse> {
  try {
    // Get main listing data
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (listingError) throw listingError;

    return { listing: formatListing(listing), error: null };
  } catch (error) {
    console.error('Error getting listing:', error);
    return {
      listing: null,
      error: error instanceof Error ? error : new Error('Failed to get listing')
    };
  }
}

export async function updateListing(id: string, data: ListingFormValues, userId: string): Promise<ListingResponse> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const formattedData = formatFormData(data, userId);

    // Update main listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .update(formattedData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (listingError) throw listingError;

    return { listing: formatListing(listing), error: null };
  } catch (error) {
    console.error('Error updating listing:', error);
    return {
      listing: null,
      error: error instanceof Error ? error : new Error('Failed to update listing')
    };
  }
}

export const getTestListings = async (userId: string): Promise<ListingBase[]> => {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .ilike('mls_number', 'TEST%')  // Filter for test listings by MLS number prefix
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching test listings:', error);
      throw error;
    }

    return (data || []).map(formatListing);
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

interface TestListingData extends Omit<ListingBase, 'id' | 'created_at' | 'updated_at'> {
  commission: Omit<CommissionStructure, 'id' | 'listing_id' | 'created_at' | 'updated_at' | 'verified_at' | 'verified_by'>;
}

export const createTestListing = async (userId: string) => {
  const testListing = {
    user_id: userId,
    title: 'Test Listing',
    slug: `test-listing-${Date.now()}`,
    description: 'This is a test listing with all required fields filled out.',
    status: 'draft' as ListingStatus,
    property_type: 'single_family' as PropertyType,
    listing_type: 'sale' as ListingType,
    price: 500000,

    // Address fields (flat structure)
    address_street_number: '123',
    address_street_name: 'Test Street',
    address_unit: null,
    city: 'Test City',
    state: 'FL',
    zip_code: '33133',
    country: 'US',

    // Location fields
    latitude: 25.7617,
    longitude: -80.1918,
    // GeoJSON Point format
    location: {
      type: 'Point',
      coordinates: [-80.1918, 25.7617] // [longitude, latitude]
    },

    // Property details
    square_feet: 2500,
    bedrooms: 4,
    bathrooms: 3,
    year_built: 2020,
    lot_size: 5000,
    parking_spaces: 2,
    stories: 2,

    // JSON fields
    features: {
      pool: true,
      garage: true,
      garden: true,
      central_ac: true,
      fireplace: true
    },
    amenities: {
      gym: true,
      spa: true,
      tennis: true,
      pool: true,
      security: true
    },
    images: [],
    documents: [],
    meta_data: {
      is_test: true,
      created_at: new Date().toISOString()
    },

    // Commission fields
    commission_amount: 3,
    commission_type: 'percentage' as CommissionType,
    commission_terms: 'Standard 3% commission with 50/50 split',
    commission_status: 'draft' as CommissionStatus,
    commission_visibility: 'private' as CommissionVisibility,
    commission_signature_data: null,
    commission_signed_at: null,
    commission_signed_by: null,
    commission_locked_at: null,
    commission_locked_by: null
  };

  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .insert([testListing])
      .select()
      .single();

    if (error) throw error;

    return { listing: formatListing(listing), error: null };
  } catch (error) {
    console.error('Error creating test listing:', error);
    return { listing: null, error };
  }
}; 