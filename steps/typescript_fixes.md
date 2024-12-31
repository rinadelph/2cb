# TypeScript Issues to Fix

## Component Issues ✅
1. RegisterForm.tsx:
   - ✅ Property 'signUp' does not exist on type 'AuthContextType'
   - ✅ Line 14: Added signUp method to AuthContextType interface

2. Session Provider:
   - ✅ Type mismatch in navigation paths
   - ✅ Line 15: Updated type to handle string | null with type guard
   - ✅ Removed unused AUTH_ROUTES import

## API Route Issues ✅
1. export-data.ts:
   - ✅ Installed @supabase/auth-helpers-nextjs
   - ✅ Removed unused 'req' parameter
   - ✅ Added proper Supabase client typing

2. auth/callback.tsx:
   - ✅ Added @supabase/auth-helpers-nextjs types

3. auth/update-password.tsx:
   - ✅ Added @supabase/auth-helpers-nextjs types

## Component Type Issues ✅
1. listings/[id].tsx:
   - ✅ Added proper type for 'img' parameter using ListingImage interface

## Authentication Issues ✅
1. LoginForm.tsx:
   - ✅ Removed unused 'router' variable

2. lib/auth.ts:
   - ✅ Removed unused 'User' import

## Settings Issues ✅
1. settings/security/index.tsx:
   - ✅ Removed unused 'Separator' import
   - ✅ Properly handled error in catch block

## Configuration Updates ✅
1. tsconfig.json:
   - ✅ Enabled forceConsistentCasingInFileNames

## Next Steps
✅ All tasks completed! The project should now be free of TypeScript and ESLint errors.