import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  ChevronLeft, ChevronRight, Expand, Bed, Bath, Square,
  Home, DollarSign, Building2, CheckSquare, MapPin, Car,
  Calendar, FileText, ScrollText, ExternalLink, Phone,
  Mail, Droplets, Waves, Anchor, Sofa
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ListingFeatures {
  construction_type: string[];
  interior_features: string[];
  exterior_features: string[];
  parking_description: string[];
  lot_description: string[];
}

interface ListingImage {
  url: string;
  position: number;
}

type ListingStatus = "draft" | "active" | "pending" | "sold" | "archived";
type PropertyType = "single_family" | "condo" | "townhouse" | "multi_family" | "land" | "commercial";

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  mls_number?: string;
  status: ListingStatus;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  folio_number?: string;
  parcel_number?: string;
  legal_description?: string;
  property_type: PropertyType;
  year_built?: string;
  bedrooms: number;
  bathrooms_full: number;
  bathrooms_half: number;
  square_feet_living: number;
  square_feet_total: number;
  lot_size_sf: number;
  garage_spaces: number;
  carport_spaces: number;
  furnished: boolean;
  pool: boolean;
  waterfront: boolean;
  water_access: boolean;
  price: number;
  tax_amount?: number;
  tax_year?: string;
  maintenance_fee?: number;
  special_assessment: boolean;
  virtual_tour_url?: string;
  broker_remarks?: string;
  showing_instructions?: string;
  listing_office: string;
  listing_agent_name: string;
  listing_agent_phone: string;
  listing_agent_email: string;
  listing_agent_license: string;
  created_at: string;
  updated_at: string;
  listing_features?: ListingFeatures;
  listing_images: ListingImage[];
}

const PropertyListing: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "sold":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header with title and badges */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {listing.mls_number && <Badge variant="outline">{listing.mls_number}</Badge>}
            <Badge variant="outline">{listing.property_type.replace('_', ' ')}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
          <p className="text-xl text-gray-600 mt-2 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            {listing.address}, {listing.city}, {listing.state} {listing.zip_code}
          </p>
        </div>
        <Badge variant={getStatusVariant(listing.status)} className="text-lg py-2 px-4">
          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
        </Badge>
      </div>

      {/* Image carousel */}
      <Card className="relative overflow-hidden group aspect-video">
        <img
          src={listing.listing_images[currentImageIndex].url}
          alt={`Property image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setCurrentImageIndex((prev) => 
              (prev - 1 + listing.listing_images.length) % listing.listing_images.length
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setCurrentImageIndex((prev) => 
              (prev + 1) % listing.listing_images.length
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setShowImageModal(true)}
        >
          <Expand className="h-4 w-4" />
        </Button>
      </Card>

      {/* Price card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">
              ${listing.price.toLocaleString()}
            </h2>
            <p className="text-lg text-gray-600 mt-1">
              ${Math.round(listing.price / listing.square_feet_living).toLocaleString()} per sqft
            </p>
          </div>
        </div>
      </Card>

      {/* Key features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Bed className="h-6 w-6" />
          <div>
            <p className="font-semibold">{listing.bedrooms} beds</p>
            <p className="text-sm text-gray-500">Bedrooms</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Bath className="h-6 w-6" />
          <div>
            <p className="font-semibold">{listing.bathrooms_full + listing.bathrooms_half * 0.5} baths</p>
            <p className="text-sm text-gray-500">{listing.bathrooms_full} full, {listing.bathrooms_half} half</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Square className="h-6 w-6" />
          <div>
            <p className="font-semibold">{listing.square_feet_living.toLocaleString()} sqft</p>
            <p className="text-sm text-gray-500">Living Area</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6" />
          <div>
            <p className="font-semibold">{listing.garage_spaces} garage</p>
            <p className="text-sm text-gray-500">+ {listing.carport_spaces} carport</p>
          </div>
        </div>
      </div>

      {/* Property badges */}
      <div className="flex flex-wrap gap-2">
        {listing.pool && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Droplets className="h-4 w-4" />
            Pool
          </Badge>
        )}
        {listing.waterfront && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Waves className="h-4 w-4" />
            Waterfront
          </Badge>
        )}
        {listing.water_access && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Anchor className="h-4 w-4" />
            Water Access
          </Badge>
        )}
        {listing.furnished && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Sofa className="h-4 w-4" />
            Furnished
          </Badge>
        )}
      </div>

      {/* Commission button */}
      <div className="flex justify-center w-full">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 text-lg w-full max-w-md flex items-center justify-center gap-3"
          onClick={() => setShowCommissionModal(true)}
        >
          <DollarSign className="h-6 w-6" />
          View Commission Information
        </Button>
      </div>

      {/* Modals */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl">
          <div className="relative w-full h-full">
            <img
              src={listing.listing_images[currentImageIndex].url}
              alt={`Full-screen property image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCommissionModal} onOpenChange={setShowCommissionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commission Information</DialogTitle>
            <DialogDescription>Details for real estate professionals</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Agent Information</h3>
              <p>{listing.listing_agent_name}</p>
              <p>{listing.listing_agent_license}</p>
              <p>{listing.listing_agent_phone}</p>
              <p>{listing.listing_agent_email}</p>
            </div>
            {listing.showing_instructions && (
              <div>
                <h3 className="font-semibold">Showing Instructions</h3>
                <p>{listing.showing_instructions}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EnhancedPropertyListingPreview: React.FC = () => {
  const sampleListing: Listing = {
    id: '07c2e76f-1719-47a7-add6-6fa4b8ca901f',
    user_id: 'user123',
    title: 'Luxurious Waterfront Property',
    description: 'Stunning waterfront property with modern amenities and breathtaking views.',
    status: 'active',
    address: '123 Ocean Drive',
    city: 'Miami Beach',
    state: 'FL',
    zip_code: '33139',
    county: 'Miami-Dade',
    property_type: 'single_family',
    bedrooms: 4,
    bathrooms_full: 3,
    bathrooms_half: 1,
    square_feet_living: 3200,
    square_feet_total: 4000,
    lot_size_sf: 8000,
    garage_spaces: 2,
    carport_spaces: 1,
    furnished: true,
    pool: true,
    waterfront: true,
    water_access: true,
    price: 2500000,
    special_assessment: false,
    listing_office: 'Luxury Realty',
    listing_agent_name: 'Jane Smith',
    listing_agent_phone: '(305) 555-0123',
    listing_agent_email: 'jane@example.com',
    listing_agent_license: 'FL RE#123456',
    created_at: '2024-01-01',
    updated_at: '2024-01-07',
    showing_instructions: 'Contact agent for showing availability',
    broker_remarks: 'Great investment opportunity in prime location',
    listing_images: [
      { url: '/api/placeholder/800/600', position: 1 },
      { url: '/api/placeholder/800/600', position: 2 },
      { url: '/api/placeholder/800/600', position: 3 }
    ]
  };

  return <PropertyListing listing={sampleListing} />;
};

export default EnhancedPropertyListingPreview;