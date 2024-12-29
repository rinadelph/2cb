'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: any;
  }
}

interface WalletContextType {
  isReady: boolean;
  error: Error | null;
}

const WalletContext = createContext<WalletContextType>({
  isReady: false,
  error: null
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeWallets = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        // Only wait if none of the wallets are present
        if (!window.ethereum && !window.solana && !window.phantom) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Increased timeout
        }

        // Don't try to redefine properties if they already exist
        setIsReady(true);
      } catch (err) {
        // Log but don't throw error - wallet functionality is optional
        console.warn('Wallet initialization skipped:', err);
        setIsReady(true); // Still set ready to true to not block the app
      }
    };

    initializeWallets();

    // Cleanup function
    return () => {
      setIsReady(false);
      setError(null);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ isReady, error }}>
      {children}
    </WalletContext.Provider>
  );
}; 