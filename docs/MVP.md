# 2-Click Broker: Core MVP Pages & Requirements

## 1. Login / Register
**Purpose**  
- Provide secure access for licensed real estate professionals.  
- Capture initial user/brokerage data.

**Data Collected**  
- Name, Email, Password  
- License Number  
- Brokerage/Organization (optional if creating a new org)  

**Key Functionality**  
- **User Creation**: Validate license (manual or automated).  
- **Login**: Basic auth with password reset.  
- **Role Assignment**: Individual agent or org admin.  

**UI/UX Notes**  
- Minimal fields, large input boxes, single accent color for buttons.  
- Quick feedback on license validation status.

---

## 2. Dashboard
**Purpose**  
- Central hub for all user actions and quick overviews.

**Key Functionality**  
- **Quick Access**: Create new listing, view listings, pending signatures.  
- **Notifications**: Commission changes, e-sign requests, org updates.  
- **Basic Metrics**: Active listings, pending contracts.

**UI/UX Notes**  
- Card-based layout with minimal text.  
- Clear CTAs for main actions (“New Listing”, “View Listings”).

---

## 3. Listings (Map + List)
**Purpose**  
- Let buyer’s agents discover listings and see commission details.

**Key Functionality**  
- **Map View**: Google Maps pins, address auto-complete.  
- **List/Grid View**: Property cards (images, price, commission).  
- **Filters**: Location, property type, commission amount, price range.  
- **Detail Modal/Page**: Larger gallery, “Lock Commission” button.

**UI/UX Notes**  
- Split-screen (map + list) on desktop.  
- Clean, minimal design for pins and listing cards.  
- One-click to initiate e-sign flow.

---

## 4. Your Listings (For Listing Agents)
**Purpose**  
- Manage (create, edit, remove) property listings.

**Key Functionality**  
- **Create Listing**: Address, property details, commission amount, photos.  
- **Edit Listing**: Update info, revise commission, change status.  
- **Status Tracking**: Active, Pending, Off-Market, etc.

**UI/UX Notes**  
- Table or card list of properties with quick “Edit” and “View” actions.  
- Clear “+ New Listing” button in accent color.

---

## 5. E-Sign / Contract Flow
**Purpose**  
- Facilitate digital signing of commission or compensation agreements.

**Key Functionality**  
1. **Initiation**: Buyer’s agent clicks “Lock Commission” on a listing.  
2. **Auto-Generated Contract**: Fills in property, agent, and commission data.  
3. **E-Sign**: Integration with e-sign APIs or custom solution.  
4. **Storage**: Final PDF accessible to both parties.  
5. **Reminders**: If signature pending or commission updated.

**UI/UX Notes**  
- Step-by-step wizard for signing.  
- Clear signature boxes with minimal form fields.

---

## 6. Settings (User/Org)
**Purpose**  
- Configure personal profiles, organization settings, and (optionally) billing.

**Key Functionality**  
- **User Profile**: Update contact info, license details, change password.  
- **Org Management**: Brokerage details, invite/remove agents, set default templates.  
- **Billing (If Applicable)**: Subscription info, payment methods.

**UI/UX Notes**  
- Tabbed layout: Personal, Organization, Billing.  
- Consistent form elements and clear toggles.

---

## 7. (Future) Analytics / File Management
**Purpose**  
- Extend functionality for data insights and advanced document handling.

**Analytics**  
- Display stats on listings, commissions, user performance.  
- Charts/graphs for quick analysis.

**File Management**  
- Repository for real estate docs (listing packages, disclosures).  
- Google Drive–style folders or drag-and-drop uploads.

**UI/UX Notes**  
- Graphical dashboards (light charts, minimal color).  
- Clean file browser with easy previews.

---

## Design & Style Summary
- **Minimal, Google/Apple-Inspired**: Light backgrounds, generous whitespace, consistent accent color.  
- **Responsive Layouts**: Split screens (map + list), mobile-friendly form factors.  
- **Clear CTAs**: Prominent “Lock Commission” or “New Listing” buttons.  
- **Consistency**: Reusable components (cards, modals, forms) across all pages.  

