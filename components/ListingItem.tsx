import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '../types/listing';
import { Button } from './ui/button';

interface ListingItemProps {
  listing: Listing;
}

const ListingItem: React.FC<ListingItemProps> = ({ listing }) => {
  const mainImage = listing.images?.[0];

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
      {listing.description && (
        <p className="text-gray-600 mb-2">{listing.description.substring(0, 100)}...</p>
      )}
      <p className="text-lg font-bold mb-4">${listing.price}</p>
      {mainImage && (
        <div className="relative w-full h-48 mb-4">
          <Image 
            src={mainImage.url} 
            alt={listing.title} 
            fill
            className="object-cover rounded"
          />
        </div>
      )}
      <Link href={`/listings/${listing.id}`}>
        <Button>View Details</Button>
      </Link>
    </div>
  );
};

export default ListingItem;