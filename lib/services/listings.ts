import { getSupabaseClient } from "@/lib/supabase-client";
import { ListingFormValues } from "@/lib/schemas/listing-schema";
import { ListingBase, ListingFeatures, ListingAmenities, ListingFormBase, Listing, ListingImage } from "@/types/listing";
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
  listing: Listing | null;
  error: Error | null;
}

interface RawImage {
  id?: string;
  url: string;
  width?: number;
  height?: number;
  size?: number;
  type?: string;
  is_featured?: boolean;
  order?: number;
  meta_data?: Record<string, unknown>;
}

interface RawListing {
  id: string;
  user_id?: string;
  organization_id?: string;
  title: string;
  description: string;
  status: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  lot_size: number;
  year_built: number;
  parking_spaces: number;
  stories: number;
  address_street_number: string;
  address_street_name: string;
  address_unit?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  listing_office: string;
  listing_agent_name: string;
  listing_agent_phone: string;
  listing_agent_email: string;
  listing_agent_license: string;
  showing_instructions?: string;
  broker_remarks?: string;
  mls_number: string;
  virtual_tour_url?: string;
  property_tax?: number;
  maintenance_fee?: number;
  construction_type?: string;
  interior_features?: string[];
  exterior_features?: string[];
  parking?: string;
  lot_features?: string[];
  view?: string;
  waterfront?: boolean;
  pool?: boolean;
  commission_amount?: string;
  commission_type?: string;
  commission_terms?: string;
  commission_status?: string;
  commission_visibility?: string;
  features?: ListingFeatures;
  amenities?: ListingAmenities;
  images?: RawImage[];
  created_at: string;
  updated_at: string;
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

const formatListing = (listing: Partial<RawListing>): Listing => ({
  id: listing.id || '',
  user_id: listing.user_id,
  organization_id: listing.organization_id,
  title: listing.title || '',
  description: listing.description || '',
  status: mapStatus(listing.status || '') as ListingFormBase['status'],
  property_type: listing.property_type || 'single_family',
  listing_type: listing.listing_type || 'sale',
  price: Number(listing.price) || 0,
  bedrooms: Number(listing.bedrooms) || 0,
  bathrooms: Number(listing.bathrooms) || 0,
  square_feet: Number(listing.square_feet) || 0,
  lot_size: Number(listing.lot_size) || 0,
  year_built: Number(listing.year_built) || 0,
  parking_spaces: Number(listing.parking_spaces) || 0,
  stories: Number(listing.stories) || 0,
  address_street_number: listing.address_street_number || '',
  address_street_name: listing.address_street_name || '',
  address_unit: listing.address_unit,
  address: listing.address || '',
  city: listing.city || '',
  state: listing.state || '',
  zip_code: listing.zip_code || '',
  country: listing.country,
  location: listing.location?.type === 'Point' ? {
    type: 'Point',
    coordinates: [
      listing.location.coordinates[0],
      listing.location.coordinates[1]
    ],
    lat: listing.location.coordinates[1],
    lng: listing.location.coordinates[0]
  } : undefined,
  listing_office: listing.listing_office || '',
  listing_agent_name: listing.listing_agent_name || '',
  listing_agent_phone: listing.listing_agent_phone || '',
  listing_agent_email: listing.listing_agent_email || '',
  listing_agent_license: listing.listing_agent_license || '',
  showing_instructions: listing.showing_instructions,
  broker_remarks: listing.broker_remarks,
  mls_number: listing.mls_number || '',
  virtual_tour_url: listing.virtual_tour_url,
  property_tax: listing.property_tax,
  maintenance_fee: listing.maintenance_fee,
  construction_type: listing.construction_type,
  interior_features: listing.interior_features,
  exterior_features: listing.exterior_features,
  parking: listing.parking,
  lot_features: listing.lot_features,
  view: listing.view,
  waterfront: listing.waterfront,
  pool: listing.pool,
  commission_amount: listing.commission_amount,
  commission_type: listing.commission_type,
  commission_terms: listing.commission_terms,
  commission_status: listing.commission_status,
  commission_visibility: listing.commission_visibility,
  features: listing.features,
  amenities: listing.amenities,
  created_at: listing.created_at || new Date().toISOString(),
  updated_at: listing.updated_at || new Date().toISOString(),
  images: formatImages(listing.images || [])
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
    const { data: listing, error: listingError } = await getSupabaseClient()
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
    const { data: listing, error: listingError } = await getSupabaseClient()
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
    const { data, error } = await getSupabaseClient()
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

    const formattedData = formatFormData(data, userId);

    // Create main listing
    const { data: listing, error: listingError } = await getSupabaseClient()
      .from('listings')
      .insert(formattedData)
      .select()
      .single();

    if (listingError) throw listingError;

    return { listing: formatListing(listing), error: null };
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

    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data: listing, error } = await getSupabaseClient()
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

const formatImages = (images: RawImage[] = []): ListingImage[] => 
  images.map(image => ({
    id: image.id || crypto.randomUUID(),
    url: image.url,
    position: image.order || 0,
    is_featured: Boolean(image.is_featured)
  }));

export function transformListingData(data: RawListing): ListingBase {
  return formatListing(data);
} 