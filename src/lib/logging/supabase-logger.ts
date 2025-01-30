import { SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseLogger(supabase: SupabaseClient) {
  const originalFetch = supabase.rest.headers;

  // Intercept and log all Supabase requests
  supabase.rest.headers = async () => {
    const headers = await originalFetch();
    return {
      ...headers,
      'X-Custom-Logger': 'true',
    };
  };

  // Monkey patch the fetch method to log requests
  const originalFetchImplementation = (global as any).fetch;
  (global as any).fetch = async (...args: any[]) => {
    const [url, config] = args;

    // Only log Supabase requests
    if (url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
      console.group('🔷 Supabase Request');
      console.log('URL:', url);
      console.log('Method:', config?.method || 'GET');
      console.log('Headers:', config?.headers);
      console.log('Body:', config?.body ? JSON.parse(config.body) : null);
      console.groupEnd();

      try {
        const response = await originalFetchImplementation(...args);
        const clonedResponse = response.clone();
        const responseData = await clonedResponse.json();

        console.group('🔷 Supabase Response');
        console.log('Status:', response.status);
        console.log('Data:', responseData);
        console.groupEnd();

        return response;
      } catch (error) {
        console.group('🔷 Supabase Error');
        console.error('Request failed:', error);
        console.groupEnd();
        throw error;
      }
    }

    return originalFetchImplementation(...args);
  };
} 