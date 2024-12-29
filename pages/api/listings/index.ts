import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase-client';
import { ListingFormValues } from '@/lib/schemas/listing-schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body as ListingFormValues & { user_id: string };

    // Convert numeric fields to strings for database storage
    const formattedData = {
      ...data,
      price: data.price.toString(),
      tax_amount: data.tax_amount?.toString(),
      maintenance_fee: data.maintenance_fee?.toString(),
      square_feet_living: data.square_feet_living?.toString(),
      square_feet_total: data.square_feet_total?.toString(),
      lot_size_sf: data.lot_size_sf?.toString(),
      bedrooms: data.bedrooms?.toString(),
      bathrooms_full: data.bathrooms_full?.toString(),
      bathrooms_half: data.bathrooms_half?.toString(),
      garage_spaces: data.garage_spaces?.toString(),
      carport_spaces: data.carport_spaces?.toString(),
    };

    // Create main listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert([formattedData])
      .select()
      .single();

    if (listingError) throw listingError;

    if (listing) {
      // Create listing features
      const { error: featuresError } = await supabase
        .from('listing_features')
        .insert([{
          listing_id: listing.id,
          construction_type: data.construction_type,
          interior_features: data.interior_features,
          exterior_features: data.exterior_features,
          parking_description: data.parking_description,
          lot_description: data.lot_description
        }]);

      if (featuresError) throw featuresError;

      // Create listing images
      if (data.images && data.images.length > 0) {
        const imageInserts = data.images.map((url, index) => ({
          listing_id: listing.id,
          url,
          position: index
        }));

        const { error: imagesError } = await supabase
          .from('listing_images')
          .insert(imageInserts);

        if (imagesError) throw imagesError;
      }
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    return res.status(500).json({ error: 'Failed to create listing' });
  }
} 