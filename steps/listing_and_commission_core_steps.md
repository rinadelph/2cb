## 0. Development Environment Setup [✅ COMPLETED]
- [✅] Install Docker Desktop
- [✅] Start Docker Desktop
- [✅] Verify Docker is running

## 1. Database Schema Enhancement [FOUNDATION]

### 1.1 Base Tables Setup [✅ COMPLETED]
```sql:migrations/000001_base_tables.sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create enum types
CREATE TYPE listing_status AS ENUM (
  'draft', 'pending', 'active', 'inactive', 'expired', 'sold'
);

CREATE TYPE property_type AS ENUM (
  'single_family', 'multi_family', 'condo', 'townhouse', 
  'land', 'commercial', 'industrial'
);

CREATE TYPE listing_type AS ENUM (
  'sale', 'rent', 'lease', 'auction'
);

-- Create address type
CREATE TYPE address_components AS (
  street_number VARCHAR(20),
  street_name VARCHAR(100),
  unit VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(2),
  zip VARCHAR(10),
  country VARCHAR(2)
);
```

### 1.2 Listing Schema Updates [✅ COMPLETED]
```sql:migrations/000002_listings_table.sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  status listing_status DEFAULT 'draft',
  property_type property_type NOT NULL,
  listing_type listing_type NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  square_feet INTEGER,
  bedrooms SMALLINT,
  bathrooms DECIMAL(3,1),
  year_built INTEGER,
  lot_size DECIMAL(12,2),
  parking_spaces SMALLINT,
  stories SMALLINT,
  address address_components NOT NULL,
  location GEOMETRY(Point, 4326),
  features JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  meta_data JSONB DEFAULT '{}',
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_square_feet CHECK (square_feet IS NULL OR square_feet >= 0),
  CONSTRAINT valid_year CHECK (year_built IS NULL OR year_built BETWEEN 1800 AND EXTRACT(YEAR FROM NOW()) + 1)
);

-- Indices for performance
CREATE INDEX listings_user_id_idx ON listings(user_id);
CREATE INDEX listings_status_idx ON listings(status);
CREATE INDEX listings_location_idx ON listings USING gist(location);
CREATE INDEX listings_search_idx ON listings USING gin(search_vector);
CREATE INDEX listings_price_idx ON listings(price);
CREATE INDEX listings_created_at_idx ON listings(created_at);
```

### 1.3 Commission Schema Updates [✅ COMPLETED]
```sql:migrations/000003_commission_tables.sql
-- Commission structure table
CREATE TABLE commission_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'flat')),
  amount DECIMAL(5,2) NOT NULL CHECK (amount >= 0),
  split_percentage DECIMAL(5,2) CHECK (split_percentage BETWEEN 0 AND 100),
  terms TEXT,
  verification_required BOOLEAN DEFAULT true,
  visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'verified_only')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  CONSTRAINT valid_commission CHECK (
    (type = 'percentage' AND amount <= 100) OR
    (type = 'flat')
  )
);

-- Indices
CREATE INDEX commission_listing_idx ON commission_structures(listing_id);
CREATE INDEX commission_verified_idx ON commission_structures(verified_at);
CREATE INDEX commission_history_time_idx ON commission_history(changed_at);
CREATE INDEX commission_verification_status_idx ON commission_verifications(status);
```

## 2. Type Definitions [✅ COMPLETED]

### 2.1 Core Types [✅ COMPLETED]
```typescript:types/core.ts
export type ListingStatus = 'draft' | 'pending' | 'active' | 'inactive' | 'expired' | 'sold';

export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'industrial';

export type ListingType = 'sale' | 'rent' | 'lease' | 'auction';

export interface Address {
  street_number: string;
  street_name: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}
```

### 2.2 Listing Types [✅ COMPLETED]
```typescript:types/listing.ts
import { Address, GeoLocation, ListingStatus, PropertyType, ListingType } from './core';

export interface ListingBase {
  id: string;
  user_id: string;
  organization_id?: string;
  title: string;
  slug: string;
  description: string;
  status: ListingStatus;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  year_built?: number;
  lot_size?: number;
  parking_spaces?: number;
  stories?: number;
  address: Address;
  location?: GeoLocation;
  features: string[];
  amenities: string[];
  images: ListingImage[];
  documents: ListingDocument[];
  meta_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  published_at?: string;
  expires_at?: string;
}

export interface ListingImage {
  id: string;
  url: string;
  width: number;
  height: number;
  size: number;
  type: string;
  is_featured: boolean;
  order: number;
  meta_data?: Record<string, unknown>;
}

export interface ListingDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}
```

### 2.3 Commission Types
```typescript:types/commission.ts
export type CommissionType = 'percentage' | 'flat';
export type CommissionVisibility = 'private' | 'public' | 'verified_only';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface CommissionStructure {
  id: string;
  listing_id: string;
  type: CommissionType;
  amount: number;
  split_percentage?: number;
  terms?: string;
  verification_required: boolean;
  visibility: CommissionVisibility;
  created_at: string;
  updated_at: string;
  verified_at?: string;
  verified_by?: string;
}

export interface CommissionVerification {
  id: string;
  commission_id: string;
  verified_by: string;
  verification_type: string;
  verification_data?: Record<string, unknown>;
  verified_at: string;
  expires_at?: string;
  status: VerificationStatus;
  notes?: string;
}
```

## 3. UI Components [IMPLEMENTATION]

### 3.1 Listing Form Components
```typescript:components/listing/ListingForm/index.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema } from '@/schemas/listing';
import { ListingBase } from '@/types/listing';
import { BasicInfo } from './BasicInfo';
import { LocationInfo } from './LocationInfo';
import { Features } from './Features';
import { Images } from './Images';
import { Commission } from './Commission';

export const ListingForm = ({
  initialData,
  onSubmit,
}: {
  initialData?: Partial<ListingBase>;
  onSubmit: (data: ListingBase) => Promise<void>;
}) => {
  const form = useForm<ListingBase>({
    resolver: zodResolver(listingSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <BasicInfo form={form} />
        <LocationInfo form={form} />
      </div>
      <Features form={form} />
      <Images form={form} />
      <Commission form={form} />
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => form.reset()}>Reset</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Listing'}
        </Button>
      </div>
    </form>
  );
};
```

### 3.2 Commission Components
```typescript:components/commission/CommissionForm/index.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commissionSchema } from '@/schemas/commission';
import { CommissionStructure } from '@/types/commission';
import { Amount } from './Amount';
import { Terms } from './Terms';
import { Verification } from './Verification';

export const CommissionForm = ({
  initialData,
  onSubmit,
  listingPrice,
}: {
  initialData?: Partial<CommissionStructure>;
  onSubmit: (data: CommissionStructure) => Promise<void>;
  listingPrice: number;
}) => {
  const form = useForm<CommissionStructure>({
    resolver: zodResolver(commissionSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Amount form={form} listingPrice={listingPrice} />
      <Terms form={form} />
      <Verification form={form} />
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => form.reset()}>Cancel</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save Commission'}
        </Button>
      </div>
    </form>
  );
};
```

## 4. Pages Implementation [ROUTES]

### 4.1 Listing Creation Page
```typescript:pages/listings/create.tsx
import { useRouter } from 'next/router';
import { ListingForm } from '@/components/listing/ListingForm';
import { createListing } from '@/lib/api/listings';
import { useToast } from '@/hooks/use-toast';

export default function CreateListing() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: ListingBase) => {
    try {
      const listing = await createListing(data);
      toast({
        title: 'Success',
        description: 'Listing created successfully',
      });
      router.push(`/listings/${listing.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listing',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Create New Listing</h1>
      <ListingForm onSubmit={handleSubmit} />
    </div>
  );
}
```

### 4.2 Listing Detail Page
```typescript:pages/listings/[id].tsx
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getListing, updateListing } from '@/lib/api/listings';
import { ListingDetail } from '@/components/listing/ListingDetail';
import { CommissionSection } from '@/components/commission/CommissionSection';
import { useToast } from '@/hooks/use-toast';

export default function ListingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const { data: listing, isLoading } = useQuery(
    ['listing', id],
    () => getListing(id as string),
    { enabled: !!id }
  );

  const mutation = useMutation(updateListing, {
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Listing updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update listing',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!listing) return <NotFound />;

  return (
    <div className="container max-w-7xl py-8">
      <ListingDetail listing={listing} onUpdate={mutation.mutate} />
      <CommissionSection 
        listingId={listing.id} 
        listingPrice={listing.price}
        commission={listing.commission_structure} 
      />
    </div>
  );
}
```

[Continue with API Routes, State Management, and Testing sections...]

## 5. Implementation Order

### Phase 1: Foundation (Week 1)
1. Database schema updates
2. Type definitions
3. Basic validation schemas
4. Core API routes

### Phase 2: Core Features (Week 2)
1. Commission form component
2. Commission display component
3. Integration with listing form
4. Basic commission history

### Phase 3: Enhancement (Week 3)
1. Commission verification flow
2. History tracking
3. Advanced validation
4. Security policies

### Phase 4: Polish (Week 4)
1. UI/UX improvements
2. Performance optimization
3. Error handling
4. Testing

## 6. File Structure
```
src/
├── components/
│   ├── listing/
│   │   ├── ListingForm.tsx
│   │   ├── ListingDisplay.tsx
│   │   └── ListingCard.tsx
│   └── commission/
│       ├── CommissionForm.tsx
│       ├── CommissionDisplay.tsx
│       └── CommissionHistory.tsx
├── pages/
│   ├── api/
│   │   └── listings/
│   │       ├── [id]/
│   │       │   ├── index.ts
│   │       │   ├── commission.ts
│   │       │   └── history.ts
│   │       └── index.ts
│   └── listings/
│       ├── [id].tsx
│       ├── create.tsx
│       └── index.tsx
├── schemas/
│   ├── listing.ts
│   └── commission.ts
├── types/
│   └── listing.ts
└── utils/
    ├── validation.ts
    └── format.ts
```

## 7. Testing Strategy

### 7.1 Unit Tests
- Commission calculations
- Validation rules
- Format utilities

### 7.2 Integration Tests
- Form submission flow
- API endpoints
- Database operations

### 7.3 E2E Tests
- Complete listing creation
- Commission updates
- Verification flow

## 8. Security Considerations

### 8.1 Database Policies
```sql:migrations/000005_security_policies.sql
-- RLS policies for listings and commissions
CREATE POLICY "Users can view their own listings"
  ON listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Additional policies...
```

### 8.2 API Security
- Authentication checks
- Rate limiting
- Input validation
- Error handling

## 9. Monitoring & Logging

### 9.1 Performance Monitoring
- API response times
- Database query performance
- Client-side rendering performance

### 9.2 Error Tracking
- API errors
- Validation failures
- Commission calculation issues 

## 7. API Routes Implementation [BACKEND]

### 7.1 Listing API Routes
```typescript:pages/api/listings/index.ts
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { listingSchema } from '@/schemas/listing';
import { rateLimit } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';

export default async function handler(req, res) {
  try {
    // Rate limiting
    const limiter = await rateLimit(req, res);
    if (!limiter.success) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (req.method) {
      case 'GET':
        const { data: listings, error: fetchError } = await supabase
          .from('listings')
          .select('*, commission_structures(*)')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        return res.status(200).json(listings);

      case 'POST':
        const validation = listingSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ error: validation.error });
        }

        const { data: listing, error: createError } = await supabase
          .from('listings')
          .insert([{ ...validation.data, user_id: user.id }])
          .select()
          .single();

        if (createError) throw createError;
        return res.status(201).json(listing);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    await logError('listings-api', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 7.2 Commission API Routes
```typescript:pages/api/listings/[id]/commission.ts
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { commissionSchema } from '@/schemas/commission';
import { verifyCommission } from '@/lib/commission';
import { logError } from '@/lib/logger';

export default async function handler(req, res) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user } } = await supabase.auth.getUser();
    const { id } = req.query;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify listing ownership
    const { data: listing } = await supabase
      .from('listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!listing || listing.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    switch (req.method) {
      case 'GET':
        const { data: commission, error: fetchError } = await supabase
          .from('commission_structures')
          .select('*, commission_verifications(*)')
          .eq('listing_id', id)
          .single();

        if (fetchError) throw fetchError;
        return res.status(200).json(commission);

      case 'POST':
      case 'PUT':
        const validation = commissionSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ error: validation.error });
        }

        // Verify commission data
        const verificationResult = await verifyCommission(validation.data);
        if (!verificationResult.success) {
          return res.status(400).json({ error: verificationResult.error });
        }

        const { data: updated, error: updateError } = await supabase
          .from('commission_structures')
          .upsert({
            ...validation.data,
            listing_id: id,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (updateError) throw updateError;
        return res.status(200).json(updated);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    await logError('commission-api', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## 8. State Management [IMPLEMENTATION]

### 8.1 Listing Store
```typescript:stores/listing-store.ts
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ListingBase } from '@/types/listing';

interface ListingStore {
  listings: ListingBase[];
  draftListing: Partial<ListingBase> | null;
  selectedListing: ListingBase | null;
  isLoading: boolean;
  error: string | null;
  setListings: (listings: ListingBase[]) => void;
  addListing: (listing: ListingBase) => void;
  updateListing: (id: string, data: Partial<ListingBase>) => void;
  setDraftListing: (draft: Partial<ListingBase> | null) => void;
  setSelectedListing: (listing: ListingBase | null) => void;
  setError: (error: string | null) => void;
}

export const useListingStore = create<ListingStore>()(
  devtools(
    persist(
      (set) => ({
        listings: [],
        draftListing: null,
        selectedListing: null,
        isLoading: false,
        error: null,
        setListings: (listings) => set({ listings }),
        addListing: (listing) => 
          set((state) => ({ listings: [...state.listings, listing] })),
        updateListing: (id, data) =>
          set((state) => ({
            listings: state.listings.map((l) =>
              l.id === id ? { ...l, ...data } : l
            ),
          })),
        setDraftListing: (draft) => set({ draftListing: draft }),
        setSelectedListing: (listing) => set({ selectedListing: listing }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'listing-store',
        partialize: (state) => ({
          draftListing: state.draftListing,
        }),
      }
    )
  )
);
```

### 8.2 Commission Store
```typescript:stores/commission-store.ts
import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { CommissionStructure, CommissionVerification } from '@/types/commission';

interface CommissionStore {
  commissions: Record<string, CommissionStructure>;
  verifications: Record<string, CommissionVerification[]>;
  isLoading: boolean;
  error: string | null;
  setCommission: (listingId: string, commission: CommissionStructure) => void;
  addVerification: (
    listingId: string, 
    verification: CommissionVerification
  ) => void;
  updateCommission: (
    listingId: string, 
    data: Partial<CommissionStructure>
  ) => void;
  setError: (error: string | null) => void;
}

export const useCommissionStore = create<CommissionStore>()(
  devtools((set) => ({
    commissions: {},
    verifications: {},
    isLoading: false,
    error: null,
    setCommission: (listingId, commission) =>
      set((state) => ({
        commissions: {
          ...state.commissions,
          [listingId]: commission,
        },
      })),
    addVerification: (listingId, verification) =>
      set((state) => ({
        verifications: {
          ...state.verifications,
          [listingId]: [
            ...(state.verifications[listingId] || []),
            verification,
          ],
        },
      })),
    updateCommission: (listingId, data) =>
      set((state) => ({
        commissions: {
          ...state.commissions,
          [listingId]: {
            ...state.commissions[listingId],
            ...data,
          },
        },
      })),
    setError: (error) => set({ error }),
  }))
);
```

[Continue with Testing, Security, and Monitoring sections...] 

## 9. Testing Implementation [QUALITY]

### 9.1 Unit Test Setup
```typescript:__tests__/setup.ts
import '@testing-library/jest-dom';
import { server } from '@/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 9.2 Commission Calculation Tests
```typescript:__tests__/utils/commission-calculator.test.ts
import { calculateCommission } from '@/utils/commission-calculator';

describe('Commission Calculator', () => {
  test('calculates percentage commission correctly', () => {
    const result = calculateCommission({
      type: 'percentage',
      amount: 5,
      listingPrice: 100000
    });
    expect(result).toBe(5000);
  });

  test('handles flat rate commission', () => {
    const result = calculateCommission({
      type: 'flat',
      amount: 5000,
      listingPrice: 100000
    });
    expect(result).toBe(5000);
  });

  test('calculates split commission correctly', () => {
    const result = calculateCommission({
      type: 'percentage',
      amount: 6,
      split_percentage: 50,
      listingPrice: 100000
    });
    expect(result).toBe(3000);
  });
});
```

### 9.3 Integration Tests
```typescript:__tests__/integration/commission-flow.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommissionForm } from '@/components/commission/CommissionForm';
import { createCommission } from '@/lib/api/commission';

jest.mock('@/lib/api/commission');

describe('Commission Flow', () => {
  test('creates commission successfully', async () => {
    const mockCommission = {
      type: 'percentage',
      amount: 5,
      terms: 'Standard terms'
    };

    (createCommission as jest.Mock).mockResolvedValueOnce({
      id: '123',
      ...mockCommission
    });

    render(<CommissionForm listingPrice={100000} />);

    fireEvent.change(screen.getByLabelText(/commission amount/i), {
      target: { value: '5' }
    });

    fireEvent.change(screen.getByLabelText(/terms/i), {
      target: { value: 'Standard terms' }
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(createCommission).toHaveBeenCalledWith(mockCommission);
    });
  });
});
```

### 9.4 E2E Tests
```typescript:cypress/e2e/listing-commission.cy.ts
describe('Listing Commission Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/listings/create');
  });

  it('creates listing with commission', () => {
    // Fill listing details
    cy.get('[data-testid="title-input"]').type('Test Property');
    cy.get('[data-testid="price-input"]').type('500000');
    cy.get('[data-testid="description-input"]')
      .type('Beautiful test property');

    // Fill commission details
    cy.get('[data-testid="commission-type-select"]')
      .select('percentage');
    cy.get('[data-testid="commission-amount-input"]')
      .type('5');
    cy.get('[data-testid="commission-terms-input"]')
      .type('Standard commission terms');

    // Submit form
    cy.get('[data-testid="submit-button"]').click();

    // Verify success
    cy.url().should('include', '/listings/');
    cy.get('[data-testid="commission-display"]')
      .should('contain', '5%');
  });
});
```

## 10. Error Handling & Logging [RELIABILITY]

### 10.1 Error Types
```typescript:types/errors.ts
export class ValidationError extends Error {
  constructor(message: string, public details: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class CommissionError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'CommissionError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}
```

### 10.2 Error Handlers
```typescript:lib/error-handlers.ts
import { logError } from './logger';
import { ValidationError, CommissionError, AuthorizationError } from '@/types/errors';

export async function handleApiError(error: unknown) {
  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: { error: 'Validation Error', details: error.details }
    };
  }

  if (error instanceof CommissionError) {
    return {
      status: 400,
      body: { error: error.message, code: error.code }
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      status: 403,
      body: { error: 'Authorization Error' }
    };
  }

  await logError('api', error);
  return {
    status: 500,
    body: { error: 'Internal Server Error' }
  };
}
```

### 10.3 Logging Implementation
```typescript:lib/logger.ts
import { Logtail } from '@logtail/node';
import { captureException } from '@sentry/node';

const logtail = new Logtail(process.env.LOGTAIL_TOKEN!);

interface LogData {
  message: string;
  level: 'info' | 'error' | 'warn';
  context?: Record<string, unknown>;
  error?: Error;
}

export async function log(data: LogData) {
  const { message, level, context, error } = data;

  if (error && level === 'error') {
    captureException(error, { extra: context });
  }

  await logtail.log({
    message,
    level,
    ...context,
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
}
```

## 11. Performance Optimization [SPEED]

### 11.1 Database Optimization
```sql:migrations/000006_performance_optimizations.sql
-- Optimize commission queries
CREATE MATERIALIZED VIEW commission_summary AS
SELECT 
  l.id as listing_id,
  l.price,
  cs.type as commission_type,
  cs.amount as commission_amount,
  cs.verified_at,
  COUNT(cv.id) as verification_count
FROM listings l
LEFT JOIN commission_structures cs ON l.id = cs.listing_id
LEFT JOIN commission_verifications cv ON cs.id = cv.commission_id
GROUP BY l.id, l.price, cs.type, cs.amount, cs.verified_at;

-- Refresh materialized view
CREATE FUNCTION refresh_commission_summary()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY commission_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_commission_summary_trigger
AFTER INSERT OR UPDATE OR DELETE ON commission_structures
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_commission_summary();
```

### 11.2 API Route Optimization
```typescript:lib/api-optimization.ts
import { redis } from '@/lib/redis';
import { ListingBase } from '@/types/listing';

export async function getCachedListing(id: string): Promise<ListingBase | null> {
  const cached = await redis.get(`listing:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

export async function cacheListing(listing: ListingBase): Promise<void> {
  await redis.setex(
    `listing:${listing.id}`,
    3600, // 1 hour
    JSON.stringify(listing)
  );
}

export async function invalidateListingCache(id: string): Promise<void> {
  await redis.del(`listing:${id}`);
}
```

[Continue with Deployment and Monitoring sections...] 

## 12. Deployment Configuration [INFRASTRUCTURE]

### 12.1 Environment Configuration
```typescript:config/environment.ts
export const environment = {
  production: process.env.NODE_ENV === 'production',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },
  redis: {
    url: process.env.REDIS_URL!,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.NODE_ENV === 'production'
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV
  },
  maps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    geocodingKey: process.env.NEXT_PUBLIC_GEOCODING_API_KEY!
  }
};

export function validateEnvironment(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'REDIS_URL',
    'NEXT_PUBLIC_GOOGLE_MAPS_KEY',
    'NEXT_PUBLIC_GEOCODING_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

### 12.2 Next.js Configuration
```typescript:next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'your-supabase-project.supabase.co',
      'maps.googleapis.com'
    ],
    formats: ['image/avif', 'image/webp']
  },
  experimental: {
    serverActions: true,
    serverComponents: true
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' }
        ]
      }
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // Custom webpack configuration
    if (!dev && !isServer) {
      Object.assign(config.resolve.alias, {
        'react/jsx-runtime.js': 'preact/compat/jsx-runtime',
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat'
      });
    }
    return config;
  }
};

module.exports = nextConfig;
```

### 12.3 Production Build Script
```bash:scripts/build-production.sh
#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting production build process..."

# Validate environment variables
echo "Validating environment..."
node scripts/validate-env.js

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run type checking
echo "Running type check..."
npm run type-check

# Run tests
echo "Running tests..."
npm run test

# Build application
echo "Building application..."
npm run build

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Build search indices
echo "Building search indices..."
node scripts/build-search-indices.js

echo "✅ Production build completed successfully!"
```

## 13. Monitoring Setup [OBSERVABILITY]

### 13.1 Performance Monitoring
```typescript:lib/monitoring/performance.ts
import { init as initApm } from '@elastic/apm-rum';
import { environment } from '@/config/environment';

export const apm = initApm({
  serviceName: 'listing-commission-service',
  serverUrl: environment.apm.serverUrl,
  environment: environment.production ? 'production' : 'development',
  distributedTracingOrigins: [environment.supabase.url],
  logLevel: environment.production ? 'error' : 'debug'
});

export function trackPageLoad(route: string): void {
  const transaction = apm.startTransaction(`Page Load: ${route}`, 'page-load');
  
  window.addEventListener('load', () => {
    if (transaction) {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      transaction.addLabels({
        'page.dns': timing.domainLookupEnd - timing.domainLookupStart,
        'page.tcp': timing.connectEnd - timing.connectStart,
        'page.ttfb': timing.responseStart - timing.requestStart,
        'page.download': timing.responseEnd - timing.responseStart,
        'page.dom_load': timing.domContentLoadedEventEnd - timing.responseEnd
      });
      transaction.end();
    }
  });
}
```

### 13.2 Error Monitoring
```typescript:lib/monitoring/error-tracking.ts
import * as Sentry from '@sentry/nextjs';
import { environment } from '@/config/environment';

export function initializeErrorTracking(): void {
  Sentry.init({
    dsn: environment.sentry.dsn,
    environment: environment.sentry.environment,
    tracesSampleRate: environment.production ? 0.1 : 1.0,
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: [
          environment.supabase.url,
          /^\/api\//
        ]
      })
    ],
    beforeSend(event) {
      if (environment.production) {
        delete event.server_name;
      }
      return event;
    }
  });
}

export function trackError(error: Error, context?: Record<string, any>): void {
  Sentry.withScope(scope => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
}
```

### 13.3 Business Metrics
```typescript:lib/monitoring/metrics.ts
import { StatsD } from 'hot-shots';
import { environment } from '@/config/environment';

const metrics = new StatsD({
  prefix: 'listing_commission.',
  globalTags: { env: environment.production ? 'prod' : 'dev' }
});

export const listingMetrics = {
  created: () => metrics.increment('listing.created'),
  updated: () => metrics.increment('listing.updated'),
  viewed: () => metrics.increment('listing.viewed'),
  searchPerformed: () => metrics.increment('listing.searched'),
  commissionAdded: () => metrics.increment('commission.added'),
  commissionVerified: () => metrics.increment('commission.verified')
};

export function trackTiming(category: string, action: string, timing: number): void {
  metrics.timing(`${category}.${action}`, timing);
}
```

[Continue with Documentation and Maintenance sections...] 

## 14. Documentation [REFERENCE]

### 14.1 API Documentation
- Endpoint specifications
- Authentication requirements
- Request/response formats
- Error codes and handling
- Rate limiting details

### 14.2 Component Documentation
- Component hierarchy
- Props documentation
- State management patterns
- Event handling
- Accessibility features

### 14.3 Database Documentation
- Schema relationships
- Indexing strategy
- Performance considerations
- Backup procedures
- Migration patterns

## 15. Maintenance Procedures [OPERATIONS]

### 15.1 Backup & Recovery
- Database backup schedule
- File storage backup
- Recovery procedures
- Data retention policies
- Disaster recovery plan

### 15.2 Regular Maintenance
- Database optimization
- Cache clearing
- Log rotation
- Security updates
- Performance monitoring

### 15.3 Scaling Considerations
- Horizontal scaling strategy
- Load balancing setup
- Cache distribution
- Database partitioning
- API rate limiting

## 16. Future Enhancements [ROADMAP]

### 16.1 Feature Enhancements
- Advanced commission calculations
- Multi-currency support
- Automated verification
- Enhanced reporting
- Mobile optimization

### 16.2 Technical Improvements
- GraphQL migration
- Real-time updates
- Enhanced caching
- Automated testing
- Performance optimization

### 16.3 Integration Opportunities
- MLS integration
- Payment processing
- Document signing
- CRM systems
- Analytics platforms 