import type { NextPage } from 'next';
import React from 'react';
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { createTestListing } from "@/lib/services/listings";
import { useListings } from "@/hooks/useListings";

const TestListingsPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { listings, isLoading, error } = useListings();

  const handleCreateTestListing = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a test listing",
        variant: "destructive"
      });
      return;
    }

    try {
      const { listing, error } = await createTestListing(user.id);
      
      if (error) throw error;
      
      if (listing) {
        toast({
          title: "Success",
          description: "Test listing created successfully",
        });
        router.push(`/listings/${listing.id}`);
      }
    } catch (error) {
      console.error('Error creating test listing:', error);
      toast({
        title: "Error",
        description: "Failed to create test listing. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>Please log in to view test listings.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Loading test listings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-red-500">Failed to load test listings</p>
          </div>
        </div>
      </Layout>
    );
  }

  const testListings = listings.filter(listing => listing.meta_data?.is_test);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Test Listings</h1>
          <Button onClick={handleCreateTestListing}>Create Test Listing</Button>
        </div>

        {testListings.length === 0 ? (
          <div className="text-center py-8">
            <p>No test listings found. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testListings.map((listing) => (
              <div
                key={listing.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                <p className="text-gray-600 mb-2">{listing.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">
                    ${listing.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {listing.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestListingsPage; 