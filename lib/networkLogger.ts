export function setupNetworkLogger() {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      console.log('Network request:', args);
      const response = await originalFetch.apply(this, args);
      console.log('Network response:', response);
      return response;
    };
  }
}