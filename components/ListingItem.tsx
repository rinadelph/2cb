import React from 'react';
import Link from 'next/link';
import { Listing } from '../types/listing';
import { Button } from './ui/button';

interface ListingItemProps {
  listing: Listing;
}

const ListingItem: React.FC<ListingItemProps> = ({ listing }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
      <p className="text-gray-600 mb-2">{listing.description.substring(0, 100)}...</p>
      <p className="text-lg font-bold mb-4">${listing.price}</p>
      {listing.image_url && (
        <img src={listing.image_url} alt={listing.title} className="w-full h-48 object-cover mb-4 rounded" />
      )}
      <Link href={`/listings/${listing.id}`} passHref>
        <Button as="a">View Details</Button>
      </Link>
    </div>
  );
};

export default ListingItem;