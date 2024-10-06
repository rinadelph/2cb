import { NextPage } from 'next';
import { ListingForm } from '../../components/ListingForm';
import { Layout } from '../../components/Layout';
import { useState, useCallback, useEffect } from 'react';
import { Alert } from '../../components/ui/alert';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../../lib/supabaseClient';
import { createListing } from '../../lib/api/listings';
import { CreateListingData } from '../../types/listing';

const CreateListingPage: NextPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const authed = await isAuthenticated();
      if (!authed) {
        router.push('/auth/login');
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleError = useCallback((err: Error) => {
    console.error("Error in CreateListingPage:", err);
    setError(err.message);
    setSuccess(null);
  }, []);

  const handleSuccess = useCallback((message: string) => {
    console.log("Success in CreateListingPage:", message);
    setSuccess(message);
    setError(null);
    setTimeout(() => {
      console.log("Redirecting to listings page");
      router.push('/listings');
    }, 2000);
  }, [router]);

  const handleSubmit = useCallback(async (data: CreateListingData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newListing = await createListing(data);
      console.log('Listing created successfully:', newListing);
      handleSuccess('Listing created successfully');
    } catch (error) {
      console.error('Error creating listing:', error);
      handleError(error instanceof Error ? error : new Error('An unknown error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSuccess, handleError]);

  if (isLoading) {
    return <Layout><div>Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>
        {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
        {success && <Alert variant="default" className="mb-4 bg-green-100 text-green-800 border-green-300">{success}</Alert>}
        <ListingForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default CreateListingPage;