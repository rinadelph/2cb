import { NextPage } from 'next';
import { ListingForm } from '../../components/ListingForm';
import { Layout } from '../../components/Layout';
import { useState, useCallback, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from '../../components/ui/alert';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../../lib/supabaseClient';
import { createListing } from '../../lib/api/listings';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <p>Something went wrong:</p>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const CreateListingPage: NextPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    setTimeout(() => {
      console.log("Redirecting to listings page");
      router.push('/listings');
    }, 2000);
  }, [router]);

  const handleSubmit = useCallback(async (data: ListingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newListing = await createListing(data);
      console.log('Listing created successfully:', newListing);
      router.push('/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [router, handleSuccess, handleError]);

  if (isLoading) {
    return <Layout><div>Loading...</div></Layout>;
  }

  return (
    <Layout>
      <ErrorBoundary>
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          {success && <Alert variant="success" className="mb-4">{success}</Alert>}
          <ListingForm 
            onError={handleError} 
            onSuccess={handleSuccess}
            onSubmit={handleSubmit}
          />
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default CreateListingPage;