import { ListingBase } from '@/types/listing';
import { ListingFormValues } from '@/schemas/listing';
import { CommissionStructure, CommissionType, CommissionVisibility } from '@/types/commission';

export function toFormValues(listing: ListingBase): Partial<ListingFormValues> {
  const formValues: Partial<ListingFormValues> = {
    id: listing.id,
    user_id: listing.user_id,
    title: listing.title,
    description: listing.description || '',
    status: listing.status,
    property_type: listing.property_type,
    listing_type: listing.listing_type,
    price: listing.price,
    
    // Address fields
    address_street_number: listing.address_street_number,
    address_street_name: listing.address_street_name,
    address_unit: listing.address_unit || '',
    city: listing.city,
    state: listing.state,
    zip_code: listing.zip_code,
    country: listing.country,
    
    // Location
    location: listing.location,
    
    // Property details
    square_feet: listing.square_feet,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    year_built: listing.year_built,
    lot_size: listing.lot_size,
    parking_spaces: listing.parking_spaces,
    
    // Features and amenities
    features: listing.features ? Object.entries(listing.features).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          acc[v] = true;
        });
      }
      return acc;
    }, {} as Record<string, boolean>) : {},
    
    amenities: listing.amenities ? Object.entries(listing.amenities).reduce((acc, [key, value]) => {
      acc[key] = Boolean(value);
      return acc;
    }, {} as Record<string, boolean>) : {},
    
    // Commission fields
    commission_status: listing.commission_status || 'draft',
    commission_visibility: listing.commission_visibility || 'private',
    commission_amount: listing.commission_amount ? Number(listing.commission_amount) : 1,
    commission_type: listing.commission_type || 'percentage',
    
    // Optional fields
    meta_data: {}
  };

  return formValues;
}

export function toDatabaseModel(formData: ListingFormValues, userId: string): Partial<ListingBase> {
  const {
    commission_amount,
    commission_type,
    commission_terms,
    commission_status,
    commission_visibility,
    ...listingData
  } = formData;

  return {
    ...listingData,
    user_id: userId,
    location: {
      type: 'Point',
      coordinates: [
        formData.location?.coordinates?.[0] || 0,
        formData.location?.coordinates?.[1] || 0
      ],
      lat: formData.location?.lat || 0,
      lng: formData.location?.lng || 0
    }
  };
}

export function toCommissionModel(formData: ListingFormValues, listingId: string): Partial<CommissionStructure> {
  return {
    listing_id: listingId,
    amount: formData.commission_amount || 1,
    type: (formData.commission_type || 'percentage') as CommissionType,
    visibility: (formData.commission_visibility || 'private') as CommissionVisibility,
    status: formData.commission_status || 'draft'
  };
}

export function transformListingToDatabase(listing: ListingBase) {
  const { location, ...rest } = listing;
  return {
    ...rest,
    location: {
      type: 'Point',
      coordinates: [
        location?.coordinates?.[0] || 0,
        location?.coordinates?.[1] || 0
      ],
      lat: location?.lat || 0,
      lng: location?.lng || 0
    }
  };
}

interface DatabaseListing {
  id: string;
  user_id?: string;
  organization_id?: string;
  title: string;
  description: string;
  status: string;
  property_type: string;
  listing_type: string;
  price: number;
  square_feet: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
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
    lat?: number;
    lng?: number;
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
  features?: {
    construction_type?: string[];
    interior_features?: string[];
    exterior_features?: string[];
    parking_description?: string[];
    lot_description?: string[];
  };
  amenities?: {
    pool?: boolean;
    waterfront?: boolean;
    water_access?: boolean;
    furnished?: boolean;
    [key: string]: boolean | undefined;
  };
  created_at: string;
  updated_at: string;
}

export function transformDatabaseToListing(listing: DatabaseListing): ListingBase {
  const { location, features, amenities, ...rest } = listing;
  return {
    ...rest,
    location: location ? {
      type: 'Point',
      coordinates: location.coordinates,
      lat: location.lat ?? location.coordinates[1],
      lng: location.lng ?? location.coordinates[0]
    } : undefined,
    features: features ? {
      construction_type: features.construction_type || [],
      interior_features: features.interior_features || [],
      exterior_features: features.exterior_features || [],
      parking_description: features.parking_description || [],
      lot_description: features.lot_description || []
    } : {},
    amenities: amenities ? Object.entries(amenities).reduce((acc, [key, value]) => {
      acc[key] = Boolean(value);
      return acc;
    }, {} as Record<string, boolean>) : {}
  } as ListingBase;
} 