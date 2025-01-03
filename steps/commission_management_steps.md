# Commission Management Implementation Steps

## 1. Database Schema Extension [IMMEDIATE]
### 1.1 Listings Table Updates
- [ ] Add to listings table:
  ```sql
  ALTER TABLE listings ADD COLUMN
    commission_amount DECIMAL(10,2),
    commission_type VARCHAR(20) CHECK (commission_type IN ('percentage', 'flat')),
    commission_terms TEXT,
    commission_signature_data JSONB,
    commission_signed_at TIMESTAMPTZ,
    commission_signed_by UUID REFERENCES auth.users(id),
    commission_locked_at TIMESTAMPTZ,
    commission_locked_by UUID REFERENCES auth.users(id),
    commission_status VARCHAR(20) DEFAULT 'draft',
    commission_visibility_type VARCHAR(20) DEFAULT 'private'
  ```

### 1.2 Commission History Table
- [ ] Create commission_changes table:
  ```sql
  CREATE TABLE commission_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id),
    previous_amount DECIMAL(10,2),
    new_amount DECIMAL(10,2),
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    signature_data JSONB,
    change_type VARCHAR(50),
    notes TEXT,
    CONSTRAINT fk_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
  )
  ```

## 2. Form Components [FOUNDATION]
### 2.1 ListingForm.tsx Updates
- [ ] Add commission fields to listingSchema:
  ```typescript
  commission_amount: z.number().min(0).optional(),
  commission_type: z.enum(['percentage', 'flat']).optional(),
  commission_terms: z.string().optional(),
  commission_visibility_type: z.enum(['private', 'public', 'verified']).default('private'),
  ```
- [ ] Add commission form section with:
  - Amount input with validation
  - Type selector (percentage/flat) with tooltips
  - Terms input with template options
  - Visibility settings
  - Signature pad integration
  - Error handling and validation feedback

### 2.2 New Components
- [ ] Create components/commission/SignaturePad.tsx
  - Canvas-based signature input
  - Clear/Reset functionality
  - Data URL conversion
  - Validation state
  - Mobile touch support

- [ ] Create components/commission/CommissionForm.tsx
  - Form state management
  - Real-time validation
  - Template selection
  - Terms customization
  - Preview mode

- [ ] Create components/commission/CommissionPreview.tsx
  - Read-only display
  - Formatted values
  - Status indicators
  - Action buttons

## 3. Listing Detail Page Updates [CORE]
### 3.1 Two-Click Access in [id].tsx
- [ ] Add commission preview card
  - Basic property info
  - Commission amount preview
  - Lock status indicator
  - Access controls

- [ ] Implement two-click access modal
  - First click: Show terms
  - Second click: Verify identity
  - Display full details
  - Signature requirement

- [ ] Add signature verification
  - Validate stored signatures
  - Show signature timestamps
  - Display signer information
  - Verification status

- [ ] Display commission history
  - Timeline view
  - Change details
  - User actions
  - Filter options

### 3.2 Commission Card Component
- [ ] Create components/commission/CommissionCard.tsx
  - Preview state
    - Limited information
    - Access controls
    - Status indicators
  - Detailed state
    - Full commission details
    - Signature display
    - Terms and conditions
  - History view
    - Change timeline
    - User actions
    - Filtering
  - PDF download button
    - Generate agreement
    - Download options
    - Print preview

## 4. API Endpoints [BACKEND]
### 4.1 Commission Management
- [ ] Create pages/api/listings/[id]/commission.ts
  - GET: Fetch commission details with access control
  - POST: Update commission with validation
  - PUT: Lock commission with signature
  - DELETE: Remove commission with authorization
  - Error handling and logging

### 4.2 Commission History
- [ ] Create pages/api/listings/[id]/commission-history.ts
  - GET: Fetch history with filters
  - POST: Add history entry with validation
  - Pagination support
  - Sorting options

## 5. Security Implementation [PROTECTION]
### 5.1 RLS Policies
- [ ] Add to supabase/migrations:
  ```sql
  -- Base commission view policy
  CREATE POLICY "Commission view requires authentication"
  ON listings
  FOR SELECT
  USING (auth.role() = 'authenticated');

  -- Commission update policy
  CREATE POLICY "Commission update requires ownership"
  ON listings
  FOR UPDATE
  USING (auth.uid() = user_id);

  -- History view policy
  CREATE POLICY "History view requires listing access"
  ON commission_changes
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM listings 
    WHERE listings.id = commission_changes.listing_id 
    AND (listings.user_id = auth.uid() OR listings.commission_visibility_type = 'public')
  ));
  ```

### 5.2 Access Control
- [ ] Implement commission visibility middleware
  - Role-based access
  - Visibility rules
  - Rate limiting
  - Audit logging

- [ ] Add signature verification
  - Timestamp validation
  - User verification
  - IP logging
  - Device tracking

- [ ] Set up commission locking logic
  - Time-based locks
  - User-based locks
  - Override rules
  - Notification system

## 6. PDF Generation [DOCUMENTATION]
### 6.1 PDF Service
- [ ] Create lib/services/pdf-generator.ts
  - Template system
  - Dynamic content
  - Signature embedding
  - Watermarking

- [ ] Create commission agreement template
  - Professional layout
  - Legal requirements
  - Variable fields
  - Branding options

- [ ] Implement PDF generation with signatures
  - Real-time generation
  - Caching strategy
  - Error handling
  - Version control

### 6.2 Storage
- [ ] Set up PDF storage in Supabase
  - Secure bucket configuration
  - Access controls
  - Lifecycle policies
  - Backup strategy

- [ ] Implement PDF caching
  - Cache invalidation
  - Version tracking
  - Storage optimization
  - Cleanup policies

- [ ] Add PDF download endpoints
  - Secure access
  - Rate limiting
  - Format options
  - Audit logging

## Integration Order:
1. Database schema updates
2. Basic commission form fields
3. Two-click access implementation
4. Commission history tracking
5. PDF generation
6. Security policies

## Compliance Focus:
- MLS commission display rules
- Real estate regulations
- Data privacy requirements
- Access control standards
- Audit requirements
- Signature laws

## File Structure:
```
components/
  commission/
    SignaturePad.tsx
    CommissionForm.tsx
    CommissionPreview.tsx
    CommissionCard.tsx
    CommissionHistory.tsx
pages/
  api/
    listings/
      [id]/
        commission.ts
        commission-history.ts
lib/
  services/
    pdf-generator.ts
    signature-validator.ts
  schemas/
    commission-schema.ts
  utils/
    commission-helpers.ts
migrations/
  commission-tables.sql
  commission-policies.sql