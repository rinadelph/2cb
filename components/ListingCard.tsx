import React from 'react';
import Image from 'next/image';
import { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const mainImage = listing.listing_images?.[0];

  return (
    <div className="listing-card">
      {mainImage && (
        <Image 
          src={mainImage.url} 
          alt={listing.title} 
          width={400}
          height={300}
          className="listing-image"
          style={{ objectFit: 'cover' }}
        />
      )}
      <h2>{listing.title}</h2>
      <p>{listing.description}</p>
      <p>Price: ${listing.price}</p>
      <p>Bedrooms: {listing.bedrooms}</p>
      <p>Bathrooms: {listing.bathrooms_full + (listing.bathrooms_half * 0.5)}</p>
    </div>
  );
};

export default ListingCard;