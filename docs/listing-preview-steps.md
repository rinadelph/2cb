# Listing Preview Page Implementation Steps

## Overview
This document outlines the steps to implement a comprehensive listing preview page that combines the functionality from the example preview and includes all listing information from the schema.

## Prerequisites
- Existing listing schema (`listing.d.ts`)
- Example preview component (`listing_preview_example.tsx`)
- Current listing page (`[id].tsx`)

## Implementation Steps

### 1. Update Layout Structure
- Implement responsive layout with main content area and sidebar
- Add header section with title, price, and status badge
- Create image gallery/carousel section
- Organize property details in tabs/sections

### 2. Core Features Implementation

#### Image Gallery
- Implement image carousel with navigation controls
- Add fullscreen image view functionality
- Show image count and current position
- Add thumbnails gallery (optional)

#### Property Information Sections
1. Main Details
   - Price and price per square foot
   - Status badge with appropriate color
   - Address with map pin icon
   - MLS number (if available)
   - Property type badge

2. Key Features Display
   - Bedrooms count with icon
   - Full and half bathrooms with icon
   - Living square footage with icon
   - Total square footage
   - Lot size
   - Garage and carport spaces
   - Year built

3. Property Highlights
   - Pool indicator
   - Waterfront status
   - Water access
   - Furnished status
   - Special assessment warning (if applicable)

4. Additional Information
   - Tax information (amount and year)
   - Maintenance fees
   - Virtual tour link
   - Legal description
   - Folio and parcel numbers

### 3. Broker Information Section
- Create dedicated broker/agent information card
- Display:
  - Listing office name
  - Agent name and license number
  - Agent contact information (phone/email)
  - Showing instructions
  - Broker remarks

### 4. Features and Amenities
- Implement expandable sections for:
  - Construction type
  - Interior features
  - Exterior features
  - Parking description
  - Lot description

### 5. UI Components to Create/Update

```typescript
// Required UI Components
interface Components {
  ImageCarousel: {
    images: ListingImage[]
    onImageChange: (index: number) => void
    showFullscreen: boolean
  }
  
  StatusBadge: {
    status: ListingStatus
    className?: string
  }
  
  PropertyFeatures: {
    features: ListingFeatures
    className?: string
  }
  
  BrokerCard: {
    agent: {
      name: string
      license: string
      phone: string
      email: string
      office: string
    }
    showingInstructions?: string
    brokerRemarks?: string
  }
}
```

### 6. Data Loading and Error Handling
- Implement loading states with skeletons
- Add error boundaries
- Handle missing or null data gracefully
- Add retry mechanisms for failed loads

### 7. Responsive Design Considerations
- Ensure mobile-first design
- Implement responsive image gallery
- Stack sections appropriately on smaller screens
- Adjust font sizes and spacing for different devices

### 8. Performance Optimizations
- Lazy load images
- Implement image optimization
- Add suspense boundaries
- Cache listing data
- Optimize re-renders

### 9. Testing Requirements
- Unit tests for components
- Integration tests for data loading
- E2E tests for user interactions
- Accessibility testing
- Responsive design testing

## Implementation Order
1. Basic layout and structure
2. Core property information display
3. Image gallery implementation
4. Broker information section
5. Features and amenities sections
6. Responsive design adjustments
7. Performance optimizations
8. Testing and refinement

## Notes
- Ensure all data from listing.d.ts schema is utilized
- Maintain consistent styling with existing UI components
- Follow accessibility best practices
- Implement proper loading states
- Handle all possible listing statuses
- Consider implementing print view 