import React from 'react';
import { Listing } from '../types/listing';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  return (
    <div className="listing-card">
      {listing.image_url && (
        <img src={listing.image_url} alt={listing.title} className="listing-image" />
      )}
      <h2>{listing.title}</h2>
      <p>{listing.description}</p>
      <p>Price: ${listing.price}</p>
      <p>Bedrooms: {listing.bedrooms}</p>
      <p>Bathrooms: {listing.bathrooms}</p>
    </div>
  );
};

export default ListingCard;