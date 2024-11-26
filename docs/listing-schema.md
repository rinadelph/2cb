# Property Listing Schema Documentation

## Basic Information
- **MLS Number** (Optional)
  - Format: Text (e.g., "A11612628")
  - Description: Multiple Listing Service reference number

- **Status**
  - Type: Enum
  - Values: 
    - `draft`
    - `active`
    - `pending`
    - `sold`
    - `archived`

## Location Details
- **Address**
  - Street: Required text
  - Unit: Optional text
  - City: Required text
  - State: Required text (2-letter code)
  - ZIP Code: Required text
  - County: Required text
  - Area Code: Optional text

- **Property Identifiers**
  - Folio Number: Optional text
  - Parcel Number: Optional text
  - Legal Description: Optional text
  - Subdivision: Optional text
  - Development: Optional text

## Property Details
- **Type & Style**
  - Property Type: Required enum
    - `single_family`
    - `condo`
    - `townhouse`
    - `multi_family`
    - `land`
    - `commercial`
  - Style: Optional text (e.g., "R30-No Pool/No Water")
  - Design Description: Optional text array (e.g., ["Attached/One Story", "Modern/Contemporary"])

- **Size & Specifications**
  - Bedrooms: Required integer
  - Bathrooms Full: Required integer
  - Bathrooms Half: Required integer
  - Square Feet (Living): Required integer
  - Square Feet (Total): Optional integer
  - Lot Size (SF): Optional integer
  - Year Built: Optional integer
  - Building Area Source: Optional text

## Features & Amenities
- **Interior Features** (JSONB)
  ```json
  {
    "bedroom_description": ["Entry Level"],
    "primary_bath": ["Dual Sinks", "Separate Tub & Shower"],
    "additional_rooms": ["Family Room"],
    "dining": ["Breakfast Area", "Formal Dining", "Snack Bar/Counter"]
  }
  ```

- **Exterior Features** (JSONB)
  ```json
  {
    "parking": {
      "garage_spaces": 0,
      "carport_spaces": 7,
      "description": ["Additional Spaces Available", "Driveway", "Street Parking"],
      "restrictions": ["Limited Number of Vehicles"]
    },
    "lot": {
      "description": ["Less Than 1/4 Acre Lot"],
      "front_exposure": "South"
    },
    "features": [
      "Exterior Lighting",
      "Fence",
      "High Impact Doors",
      "Patio",
      "Room For Pool"
    ]
  }
  ```

## Construction & Systems
- **Construction Details** (JSONB)
  ```json
  {
    "type": ["Concrete Block Construction", "Elevated Construction"],
    "roof": ["Flat Roof With Facade Front", "Shingle Roof"],
    "flooring": ["Porcelain Flooring", "Tile Floors"],
    "windows": ["High Impact Windows"],
    "storm_protection": ["Complete Impact Glass", "High Impact Door"]
  }
  ```

- **Systems & Utilities** (JSONB)
  ```json
  {
    "heating": "Other",
    "cooling": "Central Cooling",
    "water": "Municipal Water",
    "sewer": "Municipal Sewer",
    "green_energy": ["Appliances"]
  }
  ```

## Financial Information
- **Pricing**
  - List Price: Required decimal(12,2)
  - Original List Price: Optional decimal(12,2)
  - Previous List Price: Optional decimal(12,2)

- **Additional Costs**
  - Total Mortgage: Optional decimal(12,2)
  - Tax Amount: Optional decimal(12,2)
  - Tax Year: Optional integer
  - Maintenance Fee: Optional decimal(12,2)
  - Special Assessment: Boolean default false

## Marketing & Media
- **Images**
  - Type: Text array
  - Storage: Supabase Storage bucket 'listings'
  - Requirements: Minimum 1 image

- **Virtual Tours**
  - URL: Optional text
  - Type: Optional text

- **Descriptions**
  - Title: Required text
  - Description: Required text
  - Broker Remarks: Optional text
  - Internet Remarks: Optional text
  - Showing Instructions: Optional text

## Agent Information
- **Listing Office**
  - Office Name: Required text
  - Office Address: Optional text
  - Office Phone: Optional text

- **Listing Agent**
  - Name: Required text
  - License Number: Required text
  - Phone: Required text
  - Email: Required text

- **Co-Agent** (Optional)
  - Name: Optional text
  - License Number: Optional text
  - Phone: Optional text

## Timestamps & Metrics
- Created At: Timestamp with timezone
- Updated At: Timestamp with timezone
- Published At: Optional timestamp
- List Date: Optional date
- Days on Market: Integer default 0
- Views Count: Integer default 0
- Leads Count: Integer default 0

## Additional Metadata
- Features: JSONB default '{}'
- Metadata: JSONB default '{}' 