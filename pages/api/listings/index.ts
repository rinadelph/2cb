import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { getAuthUser } from '@/lib/auth';

interface NumericValidation {
  field: string;
  value: number | undefined;
  minValue: number;
  maxValue: number;
  name: string;
  required?: boolean;
}

// Enhanced validation helper
const validateNumericField = (
  value: number | undefined, 
  fieldName: string, 
  minValue: number,
  maxValue: number,
  required: boolean = false
): string | null => {
  if (value === undefined) {
    return required ? `${fieldName} is required` : null;
  }
  if (isNaN(value)) return `${fieldName} must be a valid number`;
  if (value < minValue) return `${fieldName} must be at least ${minValue}`;
  if (value > maxValue) return `${fieldName} must be less than ${maxValue}`;
  return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return res.status(401).json({ 
        message: 'Unauthorized',
        details: 'You must be logged in to create a listing'
      });
    }

    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Unauthorized',
        details: 'Missing or invalid authorization header'
      });
    }
    const token = authHeader.split(' ')[1];

    // Initialize Supabase client with auth token
    const supabase = getSupabaseClient();
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    });

    const data = req.body;

    // Validate user_id matches authenticated user
    if (data.user_id && data.user_id !== user.id) {
      return res.status(403).json({
        message: 'Forbidden',
        details: 'You can only create listings for yourself'
      });
    }

    // Enhanced numeric validations
    const validationErrors: string[] = [];
    const numericValidations: NumericValidation[] = [
      { 
        field: 'price', 
        value: data.price, 
        minValue: 0, 
        maxValue: 999999999.99, 
        name: 'Price',
        required: true 
      },
      { 
        field: 'square_feet', 
        value: data.square_feet, 
        minValue: 0, 
        maxValue: 999999, 
        name: 'Square Feet',
        required: true 
      },
      { 
        field: 'bedrooms', 
        value: data.bedrooms, 
        minValue: 0, 
        maxValue: 20, 
        name: 'Bedrooms',
        required: true 
      },
      { 
        field: 'bathrooms', 
        value: data.bathrooms, 
        minValue: 0, 
        maxValue: 20, 
        name: 'Bathrooms',
        required: true 
      },
      { 
        field: 'lot_size', 
        value: data.lot_size, 
        minValue: 0, 
        maxValue: 999.9, 
        name: 'Lot Size' 
      },
      { 
        field: 'parking_spaces', 
        value: data.parking_spaces, 
        minValue: 0, 
        maxValue: 20, 
        name: 'Parking Spaces' 
      },
      { 
        field: 'stories', 
        value: data.stories, 
        minValue: 1, 
        maxValue: 200, 
        name: 'Stories' 
      }
    ];

    numericValidations.forEach(({ field: _field, value, minValue, maxValue, name, required }) => {
      const error = validateNumericField(value, name, minValue, maxValue, required);
      if (error) validationErrors.push(error);
    });

    if (validationErrors.length > 0) {
      console.error('Validation errors:', { 
        validationErrors, 
        data,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors,
        details: 'Please check the numeric values and ensure they are within valid ranges',
        validRanges: numericValidations.map(({ name, minValue, maxValue, required }) => ({
          field: name,
          min: minValue,
          max: maxValue,
          required
        }))
      });
    }

    // Prepare listing data - ensure user_id is set correctly
    const listingData = {
      ...data,
      user_id: user.id, // Always use the authenticated user's ID
      meta_data: {
        ...data.meta_data,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
    };

    const { data: listing, error } = await supabase
      .from('listings')
      .insert([listingData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', {
        error,
        code: error.code,
        details: error.details,
        message: error.message,
        data: listingData,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
      
      // Handle specific database errors
      if (error.code === '42501') {
        return res.status(403).json({
          message: 'Permission denied',
          details: 'You do not have permission to create this listing. Please ensure you are properly authenticated.',
          code: error.code
        });
      }
      
      if (error.code === '22003') {
        return res.status(400).json({
          message: 'Numeric field overflow',
          details: 'One or more numeric values exceed the maximum allowed in the database',
          field: error.details
        });
      }
      
      return res.status(500).json({ 
        message: 'Database error',
        details: error.message,
        code: error.code
      });
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error('API error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({ 
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 