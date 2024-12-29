import dynamic from 'next/dynamic';

const CreateListingPage = dynamic(() => import('@/components/pages/CreateListingPage'), {
  ssr: false
});

export default CreateListingPage;
