"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Listing } from "@/types/listing";

export function useMapListings() {
  return useQuery({
    queryKey: ["map-listings"],
    queryFn: async () => {
      console.log("Fetching map listings...");

      // Fetch all listings including our own
      const { data: listings, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching map listings:", error);
        throw error;
      }

      console.log("Map listings fetched:", listings?.length || 0, "listings");
      return listings as Listing[];
    },
  });
} 