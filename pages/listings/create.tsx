import React from 'react';
import { useRouter } from 'next/router';
import ListingForm from '../../components/ListingForm';
import { useAuth } from '../../hooks/useAuth';
import { Layout } from '../../components/Layout';

const CreateListingPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to create a listing</h1>
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCancel = () => {
    router.push('/listings');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Create New Listing</h1>
        <ListingForm onCancel={handleCancel} />
      </div>
    </Layout>
  );
};

export default CreateListingPage;