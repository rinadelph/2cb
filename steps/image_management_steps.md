# Image Management Implementation Steps

## Overview
This document outlines the steps required to implement CRUD operations and reordering functionality for listing images in the edit listing page.

## Dependencies
1. Install required packages:
```bash
npm install react-beautiful-dnd @hello-pangea/dnd
```

## Database Changes
1. Create a new table in Supabase to track image order:
```sql
CREATE TABLE listing_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

-- Create policy to allow authenticated users to manage their listing images
CREATE POLICY "Users can manage their listing images"
ON listing_images
FOR ALL
USING (
  listing_id IN (
    SELECT id FROM listings 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  listing_id IN (
    SELECT id FROM listings 
    WHERE user_id = auth.uid()
  )
);
```

## Implementation Steps

### 1. Create Image Management Components
1. Create `components/listing/ImageGrid.tsx`:
   - Implement grid layout for displaying uploaded images
   - Add drag-and-drop functionality using react-beautiful-dnd
   - Include delete button overlay on each image
   - Show loading states during operations

2. Create `components/listing/ImageThumbnail.tsx`:
   - Display individual image thumbnails
   - Handle hover states
   - Show delete button
   - Display drag handle

### 2. Update Storage Functions
1. Modify `lib/storage.ts`:
   - Add function to delete individual images
   - Add function to update image order
   - Add function to fetch images with order information

### 3. Update Edit Listing Page
1. Modify `pages/listings/[id]/edit.tsx`:
   - Add state for managing images and their order
   - Implement image loading with order information
   - Add handlers for reordering and deletion
   - Add optimistic updates for better UX

### 4. API Endpoints
1. Create `/api/listings/[id]/images/reorder`:
   - Handle POST requests to update image order
   - Validate user ownership
   - Update database records

2. Create `/api/listings/[id]/images/[imageId]`:
   - Handle DELETE requests to remove images
   - Clean up storage
   - Update database records

## Detailed Component Implementation

### ImageGrid Component
```typescript
interface ImageGridProps {
  images: Array<{
    id: string;
    url: string;
    displayOrder: number;
  }>;
  onReorder: (startIndex: number, endIndex: number) => Promise<void>;
  onDelete: (imageId: string) => Promise<void>;
  isLoading?: boolean;
}
```

### Image Management Hooks
1. Create `hooks/useListingImages.ts`:
   - Manage image loading state
   - Handle optimistic updates
   - Provide reordering functionality
   - Handle image deletion

## Error Handling
1. Implement proper error boundaries
2. Add retry mechanisms for failed operations
3. Show appropriate error messages to users
4. Handle edge cases:
   - Concurrent edits
   - Network failures
   - Storage quota limits

## Testing
1. Test image upload functionality
2. Test drag and drop reordering
3. Test deletion with proper cleanup
4. Verify error handling
5. Test concurrent operations
6. Verify mobile responsiveness

## UI/UX Considerations
1. Show loading states during operations
2. Implement smooth animations for reordering
3. Add confirmation dialogs for deletions
4. Show progress for uploads
5. Implement responsive grid layout
6. Add keyboard navigation support
7. Ensure proper ARIA attributes for accessibility

## Security Considerations
1. Verify user permissions before operations
2. Implement rate limiting for API endpoints
3. Validate file types and sizes
4. Sanitize file names
5. Implement proper CORS policies

## Performance Optimizations
1. Implement image compression
2. Use proper caching strategies
3. Implement lazy loading for images
4. Optimize database queries
5. Use proper indexes for faster lookups

## Deployment Considerations
1. Update storage bucket policies
2. Configure proper CORS settings
3. Update API routes
4. Test in staging environment
5. Monitor for potential issues

## Future Improvements
1. Add bulk operations support
2. Implement image cropping
3. Add image metadata editing
4. Implement image search functionality
5. Add image categorization 