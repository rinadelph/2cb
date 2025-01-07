export const AUTH_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  dashboard: '/dashboard',
  profile: '/settings/profile',
  listings: '/listings',
  createListing: '/listings/create',
  editListing: (id: string) => `/listings/${id}/edit`,
  viewListing: (id: string) => `/listings/${id}`,
  manageListing: '/listings/manage',
  analytics: '/analytics',
  settings: '/settings',
} as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/settings',
  '/listings',
  '/analytics',
] as const;