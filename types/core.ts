export type ListingStatus = 'draft' | 'pending' | 'active' | 'inactive' | 'expired' | 'sold';

export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'industrial';

export type ListingType = 'sale' | 'rent' | 'lease' | 'auction';

export type CommissionType = 'percentage' | 'flat';

export type CommissionStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export type CommissionVisibility = 'private' | 'public' | 'verified_only';

export interface GeoLocation {
  lat: number;
  lng: number;
} 