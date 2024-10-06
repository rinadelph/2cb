import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ListingForm } from '../../../components/ListingForm';
import { supabase } from '../../../lib/supabaseClient';

export default function EditListing() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState(null);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  async function fetchListing() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
    } else {
      setListing(data);
    }
  }

  async function handleUpdate(data) {
    try {
      const { data: updatedListing, error } = await supabase
        .from('listings')
        .update(data)
        .eq('id', id)
        .single();

      if (error) throw error;
      console.log('Listing updated:', updatedListing);
      router.push(`/listings/${id}`);
    } catch (error) {
      console.error('Error updating listing:', error);
    }
  }

  if (!listing) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit Listing</h1>
      <ListingForm initialData={listing} onSubmit={handleUpdate} />
    </div>
  );
}