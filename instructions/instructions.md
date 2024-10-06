# 2Click Broker: Detailed Product Requirements Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Core Functionalities](#core-functionalities)
   - [Step 1: User Registration and Authentication](#step-1-user-registration-and-authentication)
   - [Step 2: Subscription Management](#step-2-subscription-management)
   - [Step 3: Listing Management](#step-3-listing-management)
   - [Step 4: Advanced Search Functionality](#step-4-advanced-search-functionality)
   - [Step 5: Interactive Map Interface](#step-5-interactive-map-interface)
   - [Step 6: Two-Click Commission Access](#step-6-two-click-commission-access)
   - [Step 7: Comprehensive Analytics System](#step-7-comprehensive-analytics-system)
   - [Step 8: Admin Panel](#step-8-admin-panel)
   - [Step 9: CRM Functionality](#step-9-crm-functionality)
4. [Key Technical Considerations](#key-technical-considerations)
5. [Development and Deployment](#development-and-deployment)
6. [Additional Packages and Considerations](#additional-packages-and-considerations)
7. [Best Practices and Considerations](#best-practices-and-considerations)

## Project Overview

2Click Broker is a subscription-based real estate platform that allows brokers to share listing and commission information in compliance with new MLS regulations. The platform's core feature is a "two-click" system that separates general listing information from commission details.

Technologies Used:
- Frontend: Next.js 14, TypeScript, Tailwind CSS, shadcn UI, Lucide Icons
- Backend: Supabase (Database, Authentication, Storage, Real-time)
- Mapping: React Leaflet or React Map GL with Supabase PostGIS
- Payments: Stripe
- Additional Libraries: React Hook Form, Zod, Recharts

## Project Structure

```
2CB/
├── .env
├── .eslintrc.json
├── .gitignore
├── next-env.d.ts
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── README.md
├── public/
│   └── images/
├── styles/
│   └── globals.css
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── listings/
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── [id].tsx
│   ├── search/
│   │   └── index.tsx
│   ├── map/
│   │   └── index.tsx
│   ├── dashboard/
│   │   └── index.tsx
│   └── admin/
│       └── index.tsx
├── components/
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MapComponent.tsx
│   ├── ListingItem.tsx
│   ├── ListingForm.tsx
│   ├── SearchBar.tsx
│   ├── Authentication/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── UI/
│       ├── Accordion.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Dropdown.tsx
│       └── Tooltip.tsx
├── lib/
│   ├── supabaseClient.ts
│   ├── auth.ts
│   ├── api/
│   │   ├── listings.ts
│   │   ├── users.ts
│   │   └── subscriptions.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useListings.ts
│   ├── useSubscription.ts
│   └── useMap.ts
├── utils/
│   ├── validators.ts
│   └── constants.ts
└── tests/
    ├── unit/
    └── e2e/
```

## Core Functionalities

### Step 1: User Registration and Authentication

#### Step 1.1: Broker Sign-Up and Login

**Objective**: Implement a secure registration and login system for brokers.

**Tasks**:
- Create registration and login forms using react-hook-form and zod for validation.
- Use Supabase Auth for authentication.
- Store user data securely in the Supabase database.

**Relevant Files**:
- `pages/auth/register.tsx`
- `pages/auth/login.tsx`
- `components/Authentication/RegisterForm.tsx`
- `components/Authentication/LoginForm.tsx`
- `lib/auth.ts`

**Example Code**:

```typescript
// lib/auth.ts
import { supabase } from './supabaseClient';

export async function signUp(email: string, password: string) {
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return user;
}

export async function signIn(email: string, password: string) {
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) throw error;
  return user;
}
```

#### Step 1.2: Email Verification

**Objective**: Ensure users verify their email addresses.

**Tasks**:
- Configure Supabase to send verification emails.
- Restrict access to certain features until email is verified.

**Example Response Handling**:

```typescript
// components/Authentication/RegisterForm.tsx
const onSubmit = async (data) => {
  try {
    await signUp(data.email, data.password);
    alert('Please check your email to verify your account.');
  } catch (error) {
    console.error(error.message);
  }
};
```

#### Step 1.3: Profile Management

**Objective**: Allow users to update their profiles.

**Tasks**:
- Create a profile page under `pages/dashboard/profile.tsx`.
- Implement form to update user information.
- Update data in Supabase database.

#### Step 1.4: Authentication-Gated Access

**Objective**: Protect routes that require authentication.

**Tasks**:
- Implement a Higher-Order Component (HOC) or custom hook `useAuth` to check authentication.
- Redirect unauthenticated users to the login page.

**Example Code**:

```typescript
// hooks/useAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const router = useRouter();
  useEffect(() => {
    const session = supabase.auth.session();
    if (!session) {
      router.push('/auth/login');
    }
  }, []);
}
```

**Packages and Considerations**:
- @supabase/supabase-js: Official Supabase client for authentication.
- jsonwebtoken: For handling JWTs if custom token management is needed.
- next-cookies: Simplifies cookie management in Next.js applications.
- Social Authentication: Configure Supabase Auth for social logins if required.

### Step 2: Subscription Management

#### Step 2.1: Tiered Subscription Plans

**Objective**: Offer different subscription levels (Basic, Pro, Enterprise).

**Tasks**:
- Define subscription tiers and their features.
- Display plans on a pricing page (`pages/pricing.tsx`).

#### Step 2.2: Payment Processing Integration (Stripe)

**Objective**: Securely process payments.

**Tasks**:
- Integrate Stripe using @stripe/stripe-js and @stripe/react-stripe-js.
- Create a checkout form component.

**Relevant Files**:
- `components/Subscription/CheckoutForm.tsx`
- `lib/api/subscriptions.ts`

**Example Code**:

```typescript
// components/Subscription/CheckoutForm.tsx
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your-public-key');

function CheckoutForm() {
  // Implement Stripe checkout form
}
```

#### Step 2.3: Subscription Status Tracking

**Objective**: Monitor user subscription status.

**Tasks**:
- Store subscription data in Supabase.
- Update user access based on subscription status.

#### Step 2.4: Access Control Based on Subscription

**Objective**: Grant or restrict features based on subscription level.

**Tasks**:
- Implement middleware or hooks to check subscription before accessing certain pages or components.

#### Step 2.5: Grace Period and Renewal Reminders

**Objective**: Handle subscription expirations gracefully.

**Tasks**:
- Send email reminders before subscription expires.
- Provide a grace period after expiration.

#### Step 2.6: Upgrade/Downgrade Functionality

**Objective**: Allow users to change their subscription plans.

**Tasks**:
- Implement plan change options in the user dashboard.
- Adjust billing accordingly via Stripe.

**Packages and Considerations**:
- stripe: Official Stripe SDK for server-side operations.
- @stripe/stripe-js: Stripe.js library for client-side operations.
- @stripe/react-stripe-js: React components for Stripe integration.
- Webhook Handling: Use stripe-webhook-middleware to validate Stripe webhooks securely.

### Step 3: Listing Management

#### Step 3.1: Upload Listings

**Objective**: Allow brokers to create new listings.

**Tasks**:
- Create a listing form (`components/ListingForm.tsx`).
- Handle image and file uploads using Supabase Storage.
- Support manual entry and consider MLS import functionality.

**Relevant Files**:
- `pages/listings/create.tsx`
- `components/ListingForm.tsx`
- `lib/api/listings.ts`

#### Step 3.2: Edit and Update Listings

**Objective**: Enable brokers to modify their listings.

**Tasks**:
- Implement edit functionality in `pages/listings/[id].tsx`.
- Ensure only listing owners can edit their listings.

#### Step 3.3: Manage Listing Status

**Objective**: Brokers can update listing statuses (e.g., active, pending).

**Tasks**:
- Provide options within the listing management page.
- Update status in the database.

#### Step 3.4: Geocoding Addresses

**Objective**: Convert addresses to geographical coordinates.

**Tasks**:
- Use Supabase's PostGIS extension or an external geocoding API.
- Store both address and coordinates in the database.

**Example Code**:

```typescript
// lib/api/listings.ts
export async function createListing(data) {
  const { error } = await supabase.from('listings').insert(data);
  if (error) throw error;
}
```

**Packages and Considerations**:
- @supabase/supabase-js: For database interactions.
- @tanstack/react-query: For data fetching and caching.
- react-dropzone: For file uploads.
- @supabase/storage-js: Supabase Storage client.

### Step 4: Advanced Search Functionality

#### Step 4.1: Text-Based Search with Autocomplete

**Objective**: Implement a responsive search bar with suggestions.

**Tasks**:
- Create a SearchBar component.
- Use Supabase's full-text search capabilities.

**Relevant Files**:
- `components/SearchBar.tsx`
- `pages/search/index.tsx`

#### Step 4.2: Implement Filters

**Objective**: Allow users to filter listings.

**Tasks**:
- Add filter options (type, price, bedrooms, features).
- Update search queries based on selected filters.

#### Step 4.3: Address-Based Search

**Objective**: Users can search listings by address.

**Tasks**:
- Implement address lookup functionality.
- Use geocoding to improve search accuracy.

#### Step 4.4: Area-Based Search on Map

**Objective**: Enable users to select areas on a map.

**Tasks**:
- Integrate drawing tools in the map component.
- Fetch listings within the selected area using geospatial queries.

**Example Code**:

```typescript
// hooks/useListings.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useListings(filters) {
  return useQuery(['listings', filters], async () => {
    let query = supabase.from('listings').select('*');

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    // Add more filter conditions...

    const { data, error } = await query;
    if (error) throw error;
    return data;
  });
}
```

#### Step 4.5: Save Search Criteria

**Objective**: Users can save their search preferences.

**Tasks**:
- Allow users to save filters and search queries.
- Store saved searches in the database.

**Packages and Considerations**:
- @supabase/postgrest-js: For advanced querying.
- Geospatial Queries: Use PostGIS functions via Supabase.
- State Management: Use zustand or redux if needed.

### Step 5: Interactive Map Interface

#### Step 5.1: Map Component Integration

**Objective**: Display listings on an interactive map.

**Tasks**:
- Use react-leaflet or react-map-gl for the map.
- Show listings as markers.

**Relevant Files**:
- `components/MapComponent.tsx`
- `pages/map/index.tsx`

**Example Code**:

```typescript
// components/MapComponent.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function MapComponent({ listings }) {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13}>
      <TileLayer url="your-tile-layer-url" />
      {listings.map((listing) => (
        <Marker position={[listing.lat, listing.lng]} key={listing.id}>
          <Popup>{listing.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

#### Step 5.2: Area Selection Tools

**Objective**: Allow users to select custom areas on the map.

**Tasks**:
- Integrate drawing tools like polygons or circles.
- Update search results based on selected area.

#### Step 5.3: Marker Clustering

**Objective**: Improve map performance in dense listing areas.

**Tasks**:
- Implement marker clustering.
- Use appropriate plugins or libraries.

**Packages and Considerations**:
- react-leaflet: For Leaflet maps.
- react-leaflet-markercluster: For clustering.
- Custom Map Styles: Apply styles based on listing types.

### Step 6: Two-Click Commission Access

#### Step 6.1: General Listing Information (First Click)

**Objective**: Show basic listing details.

**Tasks**:
- Display general information in the listing item component.
- Ensure quick access to this data.

#### Step 6.2: Commission Details Access (Second Click)

**Objective**: Provide commission details upon authorization.

**Tasks**:
- Implement a modal or separate page for commission info.
- Use token-based authorization to control access.

**Packages and Considerations**:
- Security: Ensure only authorized users can access commission details.
- UI Components: Use Modal component from UI library.

### Step 7: Comprehensive Analytics System

#### Step 7.1: User Engagement Tracking

**Objective**: Monitor how users interact with the platform.

**Tasks**:
- Track login frequency, time spent, feature usage.
- Use Supabase's real-time features or integrate with analytics services.

#### Step 7.2: Listing Performance Metrics

**Objective**: Provide insights on listings.

**Tasks**:
- Track views, inquiries, time on market, price changes.
- Display metrics in the broker dashboard.

#### Step 7.3: Search Analytics

**Objective**: Understand user search behavior.

**Tasks**:
- Analyze popular search criteria and search-to-view ratios.

#### Step 7.4: Commission Information Access Tracking

**Objective**: Monitor access to commission details.

**Tasks**:
- Log each access attempt.
- Use data for compliance and analytics.

#### Step 7.5: Subscription Analytics

**Objective**: Analyze subscription trends.

**Tasks**:
- Track conversion rates, churn rates, upgrade/downgrade patterns.

#### Step 7.6: Analytics Dashboards

**Objective**: Provide interactive dashboards.

**Tasks**:
- Use chart libraries like recharts to visualize data.
- Implement date range selectors and export options.

**Packages and Considerations**:
- recharts: For building charts and graphs.
- react-ga4: Integration with Google Analytics 4.
- mixpanel-browser: For advanced analytics (optional).
- @sentry/nextjs: For error tracking and performance monitoring.

### Step 8: Admin Panel

#### Step 8.1: User Management

**Objective**: Admins can manage users.

**Tasks**:
- View, edit, and delete user profiles.
- Manually adjust subscription statuses.

**Relevant Files**:
- `pages/admin/index.tsx`
- `components/Admin/UserManagement.tsx`

#### Step 8.2: Listing Moderation

**Objective**: Ensure content complies with policies.

**Tasks**:
- Approve or remove listings.
- Implement reporting mechanisms.

#### Step 8.3: System Configuration

**Objective**: Adjust platform-wide settings.

**Tasks**:
- Modify configurations like feature toggles.
- Update content like terms and conditions.

#### Step 8.4: Analytics Overview

**Objective**: Access platform-wide analytics.

**Tasks**:
- Display key metrics for admins.
- Use the same charting tools as in broker dashboards.

### Step 9: CRM Functionality

#### Step 9.1: Contact Management

**Objective**: Brokers can manage their contacts.

**Tasks**:
- Create a contact list feature.
- Store contacts in the database.

#### Step 9.2: Interaction Tracking

**Objective**: Log interactions with contacts.

**Tasks**:
- Allow brokers to record communications.
- Include notes and follow-up dates.

#### Step 9.3: Task and Reminder System

**Objective**: Help brokers manage tasks.

**Tasks**:
- Implement a task list with reminders.
- Send notifications or emails for important tasks.

## Key Technical Considerations

1. **Supabase Integration**
   - Authentication: Use Supabase Auth for secure user management.
   - Database Security: Implement Row Level Security (RLS) to restrict data access.
   - Geospatial Data: Utilize Supabase's PostGIS extension for geospatial queries.
   - Real-Time Features: Leverage Supabase's real-time subscriptions for live data updates.

2. **Address to Coordinate Conversion**
   - Geocoding: Use external APIs like Google Maps API if needed.
   - Data Storage: Store both the address and geolocation data for each listing.

3. **Security**
   - HTTPS: Ensure all communications are encrypted.
   - Token-Based Authorization: Secure sensitive data like commission details.
   - Regular Audits: Perform security audits and update dependencies.

4. **Performance Optimization**
   - Efficient Queries: Optimize database queries, especially for search functionality.
   - Serverless Functions: Use Supabase Edge Functions for serverless compute tasks.
   - Caching: Implement caching strategies with react-query or external services.

5. **Scalability**
   - Database Schema Design: Plan for efficient querying as data grows.
   - Load Testing: Ensure the application can handle increased traffic.

6. **Compliance**
   - Data Protection Laws: Comply with GDPR and CCPA regulations.
   - MLS Regulations: Adhere to regional MLS rules.
   - Data Retention Policies: Implement clear policies for data storage and deletion.

7. **Mobile Responsiveness**
   - Responsive Design: Use Tailwind CSS utilities to ensure the app works on all devices.

8. **Subscription Enforcement**
   - Middleware Checks: Implement checks on protected routes.
   - Feature Degradation: Gracefully limit features when subscriptions expire.

9. **Analytics Data Processing**
   - Real-Time Tracking: Use Supabase's real-time capabilities.
   - Data Warehousing: Consider data warehousing solutions for historical data analysis.

## Development and Deployment

1. **Tech Stack**
   - Frontend: Next.js, TypeScript, Tailwind CSS, shadcn UI, Lucide Icons.
   - Backend: Supabase (Auth, Database, Storage, Real-time).
   - Mapping: React Leaflet or React Map GL.
   - Payments: Stripe.
   - Additional Libraries: React Hook Form, Zod, Recharts.

2. **Project Structure**
   - Organize components using atomic design principles.
   - Separate concerns by placing API calls in the lib/api directory.
   - Use hooks directory for custom React hooks.

3. **Testing**
   - Unit Tests: Use Jest for testing components and functions.
   - Integration Tests: Test API interactions.
   - End-to-End Tests: Use Cypress to simulate user workflows.

4. **Deployment**
   - CI/CD Pipeline: Set up with GitHub Actions.
   - Hosting: Deploy frontend to Vercel.
   - Environment Variables: Manage secrets with .env files.

5. **Monitoring and Maintenance**
   - Error Tracking: Use Sentry for monitoring.
   - Performance Monitoring: Regularly check and optimize app performance.
   - Updates: Keep dependencies up-to-date.

6. **Data Migration and Backup**
   - Data Migration: Plan for seamless data migration if moving from another database.
   - Backups: Utilize Supabase's backup features for data recovery.

## Additional Packages and Considerations

- **Form Handling and Validation**:
  - react-hook-form
  - zod

- **Date Manipulation**:
  - date-fns

- **State Management**:
  - zustand or redux

- **UI Components**:
  - @headlessui/react
  - radix-ui

- **Utilities**:
  - geolib: Geospatial calculations.
  - currency.js: Handling currencies.
  - number-precision: Solve floating-point issues.

- **Image Optimization**:
  - next/image
  - sharp (if needed for server-side processing).

- **File Uploads**:
  - react-dropzone
  - @supabase/storage-js

- **Environment Variable Management**:
  - dotenv

- **Linting and Formatting**:
  - eslint, eslint-config-next
  - prettier

- **Internationalization**:
  - next-i18next

- **SEO Optimization**:
  - next-seo

- **Accessibility Tools**:
  - eslint-plugin-jsx-a11y

- **PWA Support**:
  - next-pwa

## Best Practices and Considerations

### Security
- Environment Variables: Use .env files for sensitive data.
- Input Validation: Validate on both client and server sides.
- Access Control: Implement role-based permissions.
- Regular Updates: Keep dependencies updated to patch vulnerabilities.

### Performance
- Code Splitting: Use Next.js dynamic imports.
- Data Fetching: Use react-query for efficient data handling.
- Pagination: Implement pagination to manage data loads.
- Image Optimization: Use next/image for optimized images.

### Accessibility
- Semantic HTML: Use proper HTML elements.
- Keyboard Navigation: Ensure all features are accessible via keyboard.
- ARIA Labels: Enhance accessibility with ARIA attributes.

### SEO
- Metadata Management: Use next-seo.
- Sitemap and Robots.txt: Generate for search engine crawling.

### Error Handling
- User Feedback: Provide clear messages.
- Fallbacks: Ensure app remains usable despite errors.
- Error Tracking: Use Sentry for monitoring.

### Testing
- Coverage: Aim for high test coverage.
- Continuous Testing: Integrate tests into CI/CD pipeline.
- User Flows: Test critical user journeys thoroughly.

### Continuous Integration and Deployment
- Automated Pipelines: Use GitHub Actions for CI/CD.
- Branch Management: Follow GitFlow or similar methodologies.

### Database Optimization
- Indexing: Index frequently queried fields.
- Normalization: Design efficient database schemas.
- Backups: Regularly back up data.