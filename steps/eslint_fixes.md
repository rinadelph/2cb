# ESLint Issues to Fix

## Critical Errors ✅
1. Replace `<img>` with `next/image` in:
   - ✅ `pages/login.tsx`
   - ✅ `pages/signup.tsx`
   - ✅ `components/Settings/Profile/ProfilePicture.tsx`
   - ✅ `components/ListingCard.tsx`
   - ✅ `components/ListingItem.tsx`

## React Hook Dependencies ✅
1. Fix missing dependencies in useEffect hooks:
   - ✅ `lib/auth/auth-context.tsx`:
     - First useEffect: No missing dependencies (empty dependency array is correct as it's an initialization effect)
     - Second useEffect: All dependencies are correctly listed (user, loading, router.pathname, navigate)
   - ✅ `lib/wallet/wallet-provider.tsx`:
     - useEffect: No missing dependencies (empty dependency array is correct as it's an initialization effect)

## Unused Variables ✅
1. Remove unused variables or mark them with underscore:
   - ✅ `lib/auth/auth-context.tsx`:
     - Removed unused imports: `AuthChangeEvent` and `debounce`
   - ✅ `lib/wallet/wallet-provider.tsx`:
     - Fixed unused `error` and `setError` by properly using them in error handling
   - ✅ `pages/dashboard/index.tsx`:
     - No unused variables found

## TypeScript `any` Types ✅
1. Replace `any` types with proper types:
   - ✅ `lib/auth/auth-context.tsx`:
     - No `any` types found
   - ✅ `lib/wallet/wallet-provider.tsx`:
     - Added proper types for Ethereum and Solana providers
   - ✅ `lib/supabase-client.ts`:
     - Added `ErrorWithDetails` interface
     - Replaced `any` with proper types in `logError` and `logInfo` functions
   - ✅ `lib/auth/auth-logger.ts`:
     - Added `LogData` interface
     - Replaced `any` with proper types in logger functions
   - ✅ `lib/debug.ts`:
     - Added `LogData` interface
     - Replaced `any` with proper types in logger class
   - ✅ `lib/hooks/use-google-maps.ts`:
     - Added `GoogleMapsLibrary` interface
     - Replaced `any` with proper types for Google Maps
   - ✅ `middleware.ts`:
     - Added proper cookie option types
     - Fixed cookie methods to match Supabase types
   - ✅ `pages/api/user/export-data.ts`:
     - Added proper Supabase client type
   - ✅ `pages/analytics/index.tsx`:
     - Added proper types for chart data and tooltip components

## Next Steps
✅ All tasks completed! 