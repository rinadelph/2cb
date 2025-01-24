import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { uploadListingImage, getImageDimensions } from '@/lib/storage';
import { ListingImage } from '@/types/image';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormidableFile extends formidable.File {
  originalFilename: string;
  newFilename: string;
  filepath: string;
  mimetype: string;
  size: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header',
        details: 'Please provide a valid Bearer token'
      });
    }
    const token = authHeader.split(' ')[1];

    // Initialize Supabase client with service role key for storage operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );

    console.log('[Auth Debug] Token from request:', token);
    
    // First verify the user with the provided token
    const verifyClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    
    const { data: { user }, error: userError } = await verifyClient.auth.getUser();
    console.log('[Auth Debug] User data:', { 
      userId: user?.id,
      role: user?.role,
      error: userError
    });
    
    if (userError || !user?.id) {
      console.error('Auth error:', userError);
      return res.status(401).json({ 
        error: 'Not authenticated',
        details: userError?.message || 'User not found'
      });
    }

    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      multiples: true,
    });

    const [_fields, files] = await new Promise<[formidable.Fields, Record<string, FormidableFile | FormidableFile[]>]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          reject(err);
          return;
        }
        resolve([fields, files as Record<string, FormidableFile | FormidableFile[]>]);
      });
    });

    const uploadedFiles = files.file;
    if (!uploadedFiles) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileToProcess = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;

    if (!fileToProcess) {
      return res.status(400).json({ error: 'No valid file found' });
    }

    console.log('Processing file:', {
      name: fileToProcess.originalFilename,
      type: fileToProcess.mimetype,
      size: fileToProcess.size,
      path: fileToProcess.filepath
    });

    const { path, url, size, type } = await uploadListingImage(fileToProcess, user.id, supabase);
    const dimensions = await getImageDimensions(fileToProcess);

    // Generate a new UUID for the image
    const imageId = uuidv4();

    const image: ListingImage = {
      id: imageId,
      url,
      position: 0,
      is_featured: false,
      width: dimensions.width,
      height: dimensions.height,
      size,
      type,
      meta_data: {
        originalName: fileToProcess.originalFilename || fileToProcess.newFilename,
        path
      }
    };

    console.log('Generated image data:', {
      ...image,
      idValidation: {
        isString: typeof image.id === 'string',
        length: image.id?.length,
        format: image.id,
        isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(image.id)
      }
    });

    return res.status(200).json(image);
  } catch (error) {
    console.error('Error handling image upload:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to upload image',
      details: error
    });
  }
} 