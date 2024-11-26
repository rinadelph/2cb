import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth/auth-context";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Plus } from "lucide-react";
import { getTestListings } from "@/lib/services/listings";
import { supabase } from "@/lib/supabase-client";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

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
}

export default function ListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Get test listings first
        const testListings = getTestListings(user.id);
        console.log('Test listings:', testListings);

        // Get database listings
        const { data: dbListings, error } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('DB listings:', dbListings);

        // Combine and sort all listings
        const allListings = [...testListings, ...(dbListings || [])].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        console.log('All listings:', allListings);
        setListings(allListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, [user?.id]);

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
            <p className="text-muted-foreground">
              Manage and track your property listings
            </p>
          </div>
          <Button onClick={() => router.push('/listings/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-[300px] rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : listings.length > 0 ? (
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
      </div>
    </Layout>
  );
}
