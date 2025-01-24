import { ListingForm } from '@/components/ListingForm';
import { NewListingForm } from '@/components/listings/NewListingForm';
import CreateListingPage from '@/components/pages/CreateListingPage';

export default function ListingCreatePage() {
  return (
    <>
      <NewListingForm />
      <CreateListingPage />
    </>
  );
}
