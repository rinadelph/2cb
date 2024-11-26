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

export default function ListingPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCommissionButton, setShowCommissionButton] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { id } = router.query;

  useEffect(() => {
    async function fetchListing() {
      if (!id) return;

      try {
        setLoading(true);
        
        // First check test listings
        const testListings = getTestListings(user?.id || '');
        const testListing = testListings.find(l => l.id === id);

        if (testListing) {
          setListing(testListing);
          setLoading(false);
          return;
        }

        // If not found in test listings, check database
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) setListing(data);

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
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-[500px] bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Listing not found</h1>
          <p className="text-muted-foreground mt-2">
            The listing you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.push('/listings')}
            className="mt-4"
          >
            Back to Listings
          </Button>
        </div>
      </div>
    );
  }

  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(listing.price));

  // Calculate days on market
  const daysOnMarket = Math.floor(
    (new Date().getTime() - new Date(listing.created_at).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/listings" className="text-black hover:text-primary flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Listings
          </Link>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Image Gallery */}
        <div className="relative h-[500px] rounded-xl overflow-hidden shadow-lg">
          {listing.images && listing.images.length > 0 ? (
            <>
              <Image
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                fill
                className="object-cover"
              />
              {listing.images.length > 1 && (
                <div className="absolute bottom-4 right-4 space-x-2">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full bg-white/80 backdrop-blur-sm" 
                    onClick={() => setCurrentImageIndex((prev) => 
                      prev === 0 ? listing.images.length - 1 : prev - 1
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full bg-white/80 backdrop-blur-sm" 
                    onClick={() => setCurrentImageIndex((prev) => 
                      (prev + 1) % listing.images.length
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold mb-2 text-black">{listing.title}</h1>
            <p className="text-black flex items-center mb-4">
              <MapPin className="w-4 h-4 mr-2 text-black" />
              {listing.address_street}
              {listing.address_unit && `, Unit ${listing.address_unit}`},
              {' '}{listing.city}, {listing.state} {listing.zip_code}
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Badge variant="secondary" className="text-lg px-3 py-1 text-black">
                <DollarSign className="w-4 h-4 inline mr-1 text-black" />
                {formattedPrice}
              </Badge>
              {listing.bedrooms && (
                <div className="flex items-center text-black">
                  <Bed className="w-5 h-5 mr-2 text-black" />
                  <span>{listing.bedrooms} Beds</span>
                </div>
              )}
              {listing.bathrooms_full && (
                <div className="flex items-center text-black">
                  <Bath className="w-5 h-5 mr-2 text-black" />
                  <span>{listing.bathrooms_full} Baths</span>
                </div>
              )}
              {listing.square_feet_living && (
                <div className="flex items-center text-black">
                  <Square className="w-5 h-5 mr-2 text-black" />
                  <span>{Number(listing.square_feet_living).toLocaleString()} sqft</span>
                </div>
              )}
            </div>
          </div>

          {/* Commission Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                Commission Information
                <Info className="w-4 h-4 ml-2 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-blue-700">
                <div className="flex justify-between items-center">
                  <span>Commission Rate:</span>
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                    <span className="blur-sm">x.xx%</span>
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Potential Commission:</span>
                  <span className="font-bold blur-sm">$xx,xxx</span>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    onClick={() => setShowCommissionButton(true)}
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    View Commission Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Commission Information</DialogTitle>
                    <DialogDescription>
                      Detailed commission information for this listing is available.
                    </DialogDescription>
                  </DialogHeader>
                  {showCommissionButton && (
                    <Button className="w-full mt-4" onClick={() => router.push('/commission-info')}>
                      Access Full Commission Data
                    </Button>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description" className="text-black">Description</TabsTrigger>
              <TabsTrigger value="features" className="text-black">Features</TabsTrigger>
              <TabsTrigger value="location" className="text-black">Location</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-black">{listing.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="features" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6">
                    {listing.features?.interior?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-black">Interior Features</h3>
                        <ul className="list-disc pl-5 text-black">
                          {listing.features.interior.map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {listing.features?.exterior?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-black">Exterior Features</h3>
                        <ul className="list-disc pl-5 text-black">
                          {listing.features.exterior.map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="location" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-black">
                    Located in {listing.city}, {listing.state}. {listing.county} County.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Contact Listing Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black mb-1">Name</label>
                  <input id="name" className="w-full p-2 border rounded-md text-black" type="text" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-1">Email</label>
                  <input id="email" className="w-full p-2 border rounded-md text-black" type="email" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-black mb-1">Phone</label>
                  <input id="phone" className="w-full p-2 border rounded-md text-black" type="tel" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black mb-1">Message</label>
                  <textarea id="message" className="w-full p-2 border rounded-md text-black" rows={4} required></textarea>
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}