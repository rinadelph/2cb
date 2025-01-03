export const AUTH_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/dashboard',
  resetPassword: '/reset-password',
  callback: '/auth/callback',
  verifyEmail: '/auth/verify-email',
  settings: '/settings',
  listings: '/listings',
  createListing: '/listings/create',
  manageListing: '/listings/manage',
  editListing: '/listings/edit',
  analytics: '/analytics'
} as const;

// Add route grouping types for better organization
export const PROTECTED_ROUTES = [
  AUTH_ROUTES.dashboard,
  AUTH_ROUTES.createListing,
  AUTH_ROUTES.manageListing,
  AUTH_ROUTES.editListing,
  AUTH_ROUTES.settings,
  AUTH_ROUTES.analytics
] as const;

export const PUBLIC_ROUTES = [
  '/',
  AUTH_ROUTES.login,
  AUTH_ROUTES.register,
  AUTH_ROUTES.callback,
  AUTH_ROUTES.verifyEmail,
  '/404'
] as const;

export type AuthRoutes = typeof AUTH_ROUTES;
export type AuthRoutePath = AuthRoutes[keyof AuthRoutes];
export type ProtectedRoute = typeof PROTECTED_ROUTES[number];
export type PublicRoute = typeof PUBLIC_ROUTES[number]; 