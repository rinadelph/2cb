'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (eventName: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
  selectedAddress: string | null;
  isMetaMask?: boolean;
}

interface SolanaProvider {
  connect: () => Promise<{ publicKey: string }>;
  disconnect: () => Promise<void>;
  on: (eventName: string, handler: (...args: unknown[]) => void) => void;
  off: (eventName: string, handler: (...args: unknown[]) => void) => void;
  publicKey: string | null;
  isPhantom?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    solana?: SolanaProvider;
    phantom?: SolanaProvider;
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
        setError(null);
      } catch (err) {
        // Log but don't throw error - wallet functionality is optional
        console.warn('Wallet initialization skipped:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize wallets'));
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