import { useEffect } from 'react';
import { setupNetworkLogger } from '../lib/networkLogger';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setupNetworkLogger();
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;