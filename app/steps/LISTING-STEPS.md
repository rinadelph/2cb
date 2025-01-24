# Listing Creation Steps

## Implementation Status

### ✅ 1. Basic Property Information (Implemented)
- [x] Title input with validation
- [x] Property Type selection with visual cards
- [x] Listing Type radio selection
- [x] Form state management with React Hook Form
- [x] Visual feedback for selections
- [x] Error handling

### ✅ 2. Location Details (Implemented)
- [x] Google Places integration
- [x] Address autocomplete with keyboard navigation
- [x] Map preview component
- [x] Address field parsing and validation
- [x] Loading and error states
- [x] Geocoding and coordinate handling
- [x] Progressive disclosure for unit numbers

### 🔄 3. Property Details (Next Up)
- **Purpose**: Core property specifications
- **Schema Fields**:
  - square_feet (optional number)
  - bedrooms (optional number)
  - bathrooms (optional number)
  - year_built (optional number, 1800-present)
  - lot_size (optional number)
  - stories (optional number)
- **UI Elements**:
  - Number inputs with increment/decrement
  - Slider for square footage
  - Year picker with validation
  - Quick-select common values
  - Visual size comparisons
- **Technical Requirements**:
  - Number formatting and validation
  - Min/max constraints
  - Unit conversions (if needed)
  - Real-time validation
  - Responsive layout

### 🔲 4. Features & Amenities (Pending)
- **Purpose**: Property highlights
- **Schema Fields**:
  - features (record of booleans)
  - amenities (record of booleans)
  - parking_spaces (optional number)
- **UI Elements**:
  - Icon-based feature selection
  - Grouped categories
  - Quick-toggle switches

### 🔲 5. Pricing & Status (Pending)
- **Purpose**: Listing price and availability
- **Schema Fields**:
  - price (number, min: 0)
  - status (enum: draft, pending, active, etc.)
  - commission_amount (optional number)
  - commission_type (optional string)
- **UI Elements**:
  - Large, clear price input
  - Status selector with clear visual states
  - Commission details (with privacy controls)

## Current Technical Implementation
- Form state managed by React Hook Form
- Zod schema validation
- Custom input components with error handling
- Responsive design with Tailwind CSS
- Step navigation with state preservation
- Google Maps integration
- Address validation and geocoding
- Keyboard navigation support
- Loading and error states

## Next Steps
1. Implement Property Details step
   - Create number input components
   - Add slider component for square footage
   - Implement year picker
   - Add quick-select options
2. Add form state persistence between steps
3. Implement validation between steps
4. Add progress tracking
5. Implement auto-save functionality

## UI/UX Improvements Made
- Added keyboard navigation
- Improved error handling
- Added loading states
- Enhanced visual feedback
- Implemented responsive layouts
- Added map preview
- Improved address selection UX

## Remaining UI/UX Improvements
- Add tooltips for complex fields
- Improve mobile responsiveness
- Add field-level help text
- Enhance validation feedback
- Add progress indicators
- Implement save drafts

## Overview
Breaking down the listing creation process into clear, focused steps to reduce cognitive load and improve user experience. Each step will be designed to gather specific information while maintaining a clean, intuitive interface. This implementation will replace the current single-form approach in ListingForm.tsx with a more streamlined, step-based flow while maintaining compatibility with our existing schema.

## Current System Context
- Using React Hook Form with Zod validation
- Single-form implementation with all fields visible
- Auto-save functionality for drafts
- Image handling with transformation support
- Toast notifications for user feedback

## Step Structure

### 1. Basic Property Information
- **Purpose**: Initial property categorization
- **Schema Fields**:
  - title (required, string)
  - property_type (enum: single_family, multi_family, etc.)
  - listing_type (enum: sale, rent, lease, auction)
- **UI Elements**: 
  - Large, clear icons for property types
  - Simple toggle for listing type
  - Clean, minimal input for title
- **Validation**: Immediate field validation using Zod schema

### 2. Location Details
- **Purpose**: Property location and address
- **Schema Fields**:
  - address_street_number (string)
  - address_street_name (string)
  - address_unit (optional string)
  - city (string)
  - state (string)
  - zip_code (string)
  - location (Point type with coordinates)
- **UI Elements**:
  - Address autocomplete
  - Map preview (optional)
  - Progressive disclosure for unit numbers
- **Validation**: Address verification and geocoding

### 3. Property Details
- **Purpose**: Core property specifications
- **Schema Fields**:
  - square_feet (optional number)
  - bedrooms (optional number)
  - bathrooms (optional number)
  - year_built (optional number, 1800-present)
  - lot_size (optional number)
  - stories (optional number)
- **UI Elements**:
  - Visual number selectors
  - Slider for square footage
  - Quick-select common values
- **Validation**: Numeric range validation

### 4. Features & Amenities
- **Purpose**: Property highlights
- **Schema Fields**:
  - features (record of booleans)
  - amenities (record of booleans)
  - parking_spaces (optional number)
- **UI Elements**:
  - Icon-based feature selection
  - Grouped categories
  - Quick-toggle switches
- **Validation**: Boolean field validation

### 5. Pricing & Status
- **Purpose**: Listing price and availability
- **Schema Fields**:
  - price (number, min: 0)
  - status (enum: draft, pending, active, etc.)
  - commission_amount (optional number)
  - commission_type (optional string)
- **UI Elements**:
  - Large, clear price input
  - Status selector with clear visual states
  - Commission details (with privacy controls)
- **Validation**: Price and commission validation

## UI/UX Principles
- One major decision per screen
- Clear progress indication
- Easy navigation between steps
- Save progress automatically (maintaining current auto-save functionality)
- Clear visual hierarchy
- Mobile-first design approach
- Toast notifications for user feedback

## Technical Considerations
- State management between steps using React Hook Form
- Form validation strategy using existing Zod schema
- Auto-save functionality (extending current implementation)
- Responsive design requirements
- Accessibility compliance
- Performance optimization
- Image handling and transformation
- Commission data privacy
- Draft state management

## Next Steps
1. Create component architecture (replacing current ListingForm structure)
2. Design state management solution (extending React Hook Form implementation)
3. Implement step navigation
4. Develop individual step components
5. Add validation and error handling (using existing Zod schema)
6. Implement auto-save functionality (maintaining current behavior)
7. Add image upload and management features
8. Implement commission privacy controls 