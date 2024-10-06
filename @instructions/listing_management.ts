import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ListingForm } from '../../../components/ListingForm';
import { getListing, updateListing } from '../../../lib/api/listings';
import { useAuth } from '../../../hooks/useAuth';

const EditListingPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const data = await getListing(id as string);
      setListing(data);
    } catch (err) {
      setError('Failed to fetch listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await updateListing(id as string, data, user.id);
      router.push(`/listings/${id}`);
    } catch (err) {
      setError('Failed to update listing');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!listing) return <div>Listing not found</div>;

  return (
    <div>
      <h1>Edit Listing</h1>
      <ListingForm initialData={listing} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditListingPage;

// 2. Update the ListingForm component to handle both create and edit
// File: components/ListingForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema } from '../lib/validation/listingSchema';
import { Input, Textarea, Select, Button } from './ui';

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData) => Promise<void>;
}

export const ListingForm: React.FC<ListingFormProps> = ({ initialData, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Add form fields here */}
      <Button type="submit">
        {initialData ? 'Update Listing' : 'Create Listing'}
      </Button>
    </form>
  );
};

// 3. Update the API function to handle listing updates
// File: lib/api/listings.ts

export const updateListing = async (id: string, data: Partial<Listing>, userId: string) => {
  try {
    const { data: updatedListing, error } = await supabase
      .from('listings')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return updatedListing;
  } catch (err) {
    console.error("Error updating listing:", err);
    throw err;
  }
};

// 4. Implement access control
// File: hooks/useAuth.ts

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  return { user };
};

// 5. Add an edit button to the listing detail page
// File: pages/listings/[id].tsx

import { Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';

const ListingDetailPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  // ... existing code ...

  return (
    <div>
      {/* ... existing listing details ... */}
      {user && listing.user_id === user.id && (
        <Button onClick={() => router.push(`/listings/${id}/edit`)}>
          Edit Listing
        </Button>
      )}
    </div>
  );
};

// Best Practices and Considerations:
// 1. Always validate user permissions before allowing edits.
// 2. Use optimistic UI updates for better user experience.
// 3. Implement proper error handling and user feedback.
// 4. Consider adding a confirmation step before major changes.
// 5. Log all edit actions for auditing purposes.
// 6. Implement a system for tracking listing revision history if needed.