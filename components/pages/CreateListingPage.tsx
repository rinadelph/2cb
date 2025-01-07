import type { NextPage } from 'next';
import React from 'react';
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { ListingForm } from '@/components/listing/ListingForm';
import { ListingFormValues } from '@/schemas/listing';
import { CommissionStructure } from '@/types/commission';
import { Button } from '@/components/ui/button';
import { createTestListing } from '@/lib/services/listings';

const CreateListingPage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: ListingFormValues) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, user_id: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const listing = await response.json();

      toast({
        title: "Success",
        description: "Listing created successfully",
      });

      router.push(`/listings/${listing.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCommissionSubmit = async (data: CommissionStructure) => {
    try {
      const response = await fetch('/api/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create commission structure');
      }

      toast({
        title: "Success",
        description: "Commission structure created successfully",
      });
    } catch (error) {
      console.error('Error creating commission structure:', error);
      toast({
        title: "Error",
        description: "Failed to create commission structure. Please try again.",
        variant: "destructive"
      });
    }
  };

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
            <p>Please log in to create a listing.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Create New Listing</h1>
          <Button 
            onClick={handleCreateTestListing} 
            variant="outline"
            type="button"
          >
            Create Test Listing
          </Button>
        </div>
        <ListingForm 
          onSubmit={handleSubmit}
          onCommissionSubmit={handleCommissionSubmit}
          initialData={{ user_id: user.id }}
        />
      </div>
    </Layout>
  );
};

export default CreateListingPage; 