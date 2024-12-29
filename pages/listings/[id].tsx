import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { 
  Building2, MapPin, Home, DollarSign, Calendar, 
  Ruler, Bath, Bed, Car, Droplets, Waves, Trees,
  CheckCircle2, Info, Image as ImageIcon, Phone, Mail,
  ExternalLink, Edit, Share2, Archive, ChevronLeft,
  ChevronRight, Heart, Clock, Percent, Square
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { getTestListings } from "@/lib/services/listings";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  position: number;
}

interface ListingFeatures {
  id: string;
  listing_id: string;
  construction_type: string[];
  interior_features: string[];
  exterior_features: string[];
  parking_description: string[];
  lot_description: string[];
}

interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  mls_number: string;
  status: string;
  address: string;
  address_unit?: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  property_type: string;
  year_built: string;
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
  tax_amount: number;
  tax_year: string;
  maintenance_fee: number;
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
  listing_images?: ListingImage[];
  images?: string[];
}

export default function ListingPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  useEffect(() => {
    async function fetchListing() {
      if (!id) return;

      try {
        setLoading(true);
        
        // Fetch main listing data with features and images
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            listing_features (*),
            listing_images (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Format the listing data
        const formattedListing = {
          ...data,
          price: Number(data.price) || 0,
          tax_amount: Number(data.tax_amount) || 0,
          maintenance_fee: Number(data.maintenance_fee) || 0,
          square_feet_living: Number(data.square_feet_living) || 0,
          square_feet_total: Number(data.square_feet_total) || 0,
          lot_size_sf: Number(data.lot_size_sf) || 0,
          bedrooms: Number(data.bedrooms) || 0,
          bathrooms_full: Number(data.bathrooms_full) || 0,
          bathrooms_half: Number(data.bathrooms_half) || 0,
          garage_spaces: Number(data.garage_spaces) || 0,
          carport_spaces: Number(data.carport_spaces) || 0,
          images: data.listing_images?.map(img => img.url) || []
        };

        setListing(formattedListing);
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: "Error",
          description: "Failed to load listing",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
  }, [id]);

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="h-[400px] bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </div>
        ) : !listing ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold">Listing not found</h1>
            <Button
              onClick={() => router.push('/listings')}
              variant="outline"
              className="mt-4"
            >
              Back to Listings
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <p className="text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.address}, {listing.city}, {listing.state} {listing.zip_code}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  ${Number(listing.price).toLocaleString()}
                </div>
                <Badge variant="outline" className="mt-1">
                  {listing.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Images */}
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
              {listing.images && listing.images.length > 0 ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      <span>{listing.property_type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-2" />
                      <span>{listing.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-2" />
                      <span>{listing.bathrooms_full} Full Baths</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-2" />
                      <span>{listing.square_feet_living.toLocaleString()} Sq Ft</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{listing.description}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Agent Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Listing Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium">{listing.listing_agent_name}</div>
                    <div className="text-sm text-muted-foreground">{listing.listing_office}</div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${listing.listing_agent_phone}`} className="text-primary">
                      {listing.listing_agent_phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href={`mailto:${listing.listing_agent_email}`} className="text-primary">
                      {listing.listing_agent_email}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}