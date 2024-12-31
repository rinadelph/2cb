"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema, type ListingFormValues } from '@/lib/schemas/listing-schema';
import { getListing, updateListing } from '@/lib/services/listings';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { AUTH_ROUTES } from '@/lib/auth';

export default function EditListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: async () => {
      if (typeof id !== 'string') return getDefaultValues();

      try {
        const result = await getListing(id);
        if (result.error || !result.listing) {
          toast({
            title: "Error",
            description: "Listing not found",
            variant: "destructive",
          });
          router.push(AUTH_ROUTES.listings);
          return getDefaultValues();
        }
        return result.listing;
      } catch (error) {
        console.error('Failed to fetch listing:', error);
        toast({
          title: "Error",
          description: "Failed to fetch listing",
          variant: "destructive",
        });
        return getDefaultValues();
      }
    }
  });

  const getDefaultValues = (): ListingFormValues => ({
    title: '',
    description: '',
    mls_number: '',
    status: 'draft',
    address: '',
    address_unit: '',
    city: '',
    state: '',
    zip_code: '',
    county: '',
    folio_number: '',
    parcel_number: '',
    legal_description: '',
    property_type: 'single_family',
    year_built: '',
    bedrooms: 0,
    bathrooms_full: 0,
    bathrooms_half: 0,
    square_feet_living: 0,
    square_feet_total: 0,
    lot_size_sf: 0,
    garage_spaces: 0,
    carport_spaces: 0,
    furnished: false,
    pool: false,
    waterfront: false,
    water_access: false,
    price: 0,
    tax_amount: 0,
    tax_year: '',
    maintenance_fee: 0,
    special_assessment: false,
    virtual_tour_url: '',
    broker_remarks: '',
    showing_instructions: '',
    construction_type: [],
    interior_features: [],
    exterior_features: [],
    parking_description: [],
    lot_description: [],
    images: [],
    listing_office: '',
    listing_agent_name: '',
    listing_agent_phone: '',
    listing_agent_email: '',
    listing_agent_license: ''
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit listings",
        variant: "destructive",
      });
      router.push(AUTH_ROUTES.login);
    }
  }, [user, router, toast]);

  const handleSubmit = async (data: ListingFormValues) => {
    try {
      setIsLoading(true);
      if (typeof id !== 'string') {
        throw new Error('Invalid listing ID');
      }

      if (!user?.id) {
        throw new Error('User ID is required');
      }

      const { error } = await updateListing(id, data, user.id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing updated successfully",
      });
      router.push('/listings');
    } catch (error) {
      console.error('Failed to update listing:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (!user) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-6">
        <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter listing title"
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter listing description"
                      className="min-h-[100px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}