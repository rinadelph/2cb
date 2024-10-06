import Link from 'next/link';
import { Listing } from '../types/listing';

interface ListingItemProps {
  listing: Listing;
}

export const ListingItem: React.FC<ListingItemProps> = ({ listing }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <Link href={`/listings/${listing.id}`} passHref legacyBehavior>
        <a className="block">
          <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
          <p className="text-gray-600 mb-2">{listing.description}</p>
          <p className="text-indigo-600 font-semibold">${listing.price}</p>
        </a>
      </Link>
    </div>
  );
};