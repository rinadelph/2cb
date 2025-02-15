import { ListingForm } from '@/components/ListingForm';
import { NewListingForm } from '@/components/listings/NewListingForm';
import { WorkingListingForm } from '@/components/listings/WorkingListingForm';
import CreateListingPage from '@/components/pages/CreateListingPage';

export default function ListingCreatePage() {
  return (
    <>
      <WorkingListingForm />
      <CreateListingPage />
      <NewListingForm />
    </>
  );
}
