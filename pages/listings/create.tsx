import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import ListingForm from '../../components/ListingForm';
import { useAuth } from '../../hooks/useAuth';
import { Layout } from '../../components/Layout';
import { logger } from '@/lib/debug';

const CreateListingPage: React.FC = () => {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    logger.info('Create Listing Page - Mount', {
      isLoading: loading,
      isAuthenticated,
      userId: user?.id,
      timestamp: new Date().toISOString(),
    });

    // Debug auth state changes
    return () => {
      logger.info('Create Listing Page - Unmount', {
        isAuthenticated,
        userId: user?.id,
      });
    };
  }, [user, loading, isAuthenticated]);

  if (loading) {
    logger.info('Create Listing Page - Loading');
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    logger.error('Create Listing Page - Access Denied', {
      reason: 'Not authenticated',
      redirecting: true,
    });
    router.push('/auth/login');
    return null;
  }

  logger.success('Create Listing Page - Access Granted', {
    userId: user?.id,
    email: user?.email,
  });

  const handleCancel = () => {
    router.push('/listings');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>
        <ListingForm onCancel={handleCancel} />
      </div>
    </Layout>
  );
};

export default CreateListingPage;
