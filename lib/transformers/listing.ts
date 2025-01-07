import { ListingBase } from '@/types/listing';
import { ListingFormValues } from '@/schemas/listing';
import { CommissionStructure, CommissionType, CommissionVisibility } from '@/types/commission';

export function toFormValues(listing: ListingBase): Partial<ListingFormValues> {
  return {
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
    location: {
      type: 'Point',
      coordinates: [
        listing.location?.coordinates?.[0] || 0,
        listing.location?.coordinates?.[1] || 0
      ],
      lat: listing.location?.lat || 0,
      lng: listing.location?.lng || 0
    },
    
    // Property details
    square_feet: listing.square_feet,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    year_built: listing.year_built,
    lot_size: listing.lot_size,
    parking_spaces: listing.parking_spaces,
    
    // Features and amenities
    features: listing.features || {},
    amenities: listing.amenities || {},
    images: listing.images || [],
    meta_data: listing.meta_data || {},
    
    // Commission fields (defaults)
    commission_status: 'draft',
    commission_visibility: 'private',
    commission_amount: 1, // Default to 1 to pass validation
    commission_type: 'percentage',
  };
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

export function transformDatabaseToListing(listing: any): ListingBase {
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