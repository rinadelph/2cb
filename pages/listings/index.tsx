import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth/auth-context";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Plus, ImageIcon } from "lucide-react";
import { getTestListings } from "@/lib/services/listings";
import { supabase } from "@/lib/supabase-client";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: string;
  address_street: string;
  city: string;
  state: string;
  images: string[];
  created_at: string;
  user_id: string;
}

export default function ListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        
        // Get all listings
        const { data: allDbListings, error: allError } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (allError) throw allError;
        
        setAllListings(allDbListings || []);

        // Get user's listings if logged in
        if (user?.id) {
          const testListings = await getTestListings(user.id);
          
          const { data: userDbListings, error: userError } = await supabase
            .from('listings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (userError) throw userError;

          // Combine and deduplicate user listings
          const seenIds = new Set();
          const combinedUserListings = [...testListings, ...(userDbListings || [])].filter(listing => {
            if (seenIds.has(listing.id)) return false;
            seenIds.add(listing.id);
            return true;
          }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          setUserListings(combinedUserListings);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [user?.id]);

  const ListingGrid = ({ listings }: { listings: Listing[] }) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="group cursor-pointer"
          onClick={() => router.push(`/listings/${listing.id}`)}
        >
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
            {listing.images && listing.images.length > 0 ? (
              <Image
                src={listing.images[0]}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
            <div className="absolute bottom-0 p-4 text-white">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <p className="text-sm opacity-90">
                {listing.address_street}, {listing.city}, {listing.state}
              </p>
              <p className="text-lg font-bold mt-1">
                ${Number(listing.price).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Listings</h1>
            <p className="text-muted-foreground">
              Browse and manage property listings
            </p>
          </div>
          {user && (
            <Button onClick={() => router.push('/listings/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Listing
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Listings</TabsTrigger>
            {user && <TabsTrigger value="my-listings">My Listings</TabsTrigger>}
          </TabsList>

          <TabsContent value="browse">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-[300px] rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : allListings.length > 0 ? (
              <ListingGrid listings={allListings} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold">No listings available</h3>
                <p className="text-muted-foreground">
                  Check back later for new listings
                </p>
              </div>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="my-listings">
              {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-[300px] rounded-lg bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : userListings.length > 0 ? (
                <ListingGrid listings={userListings} />
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold">No listings found</h3>
                  <p className="text-muted-foreground">
                    Create your first listing to get started
                  </p>
                  <Button
                    onClick={() => router.push('/listings/create')}
                    className="mt-4"
                  >
                    Create Listing
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
