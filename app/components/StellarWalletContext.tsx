"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStellarPublicKey, connectFreighter } from "@/lib/stellarWallet";

interface StellarWalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  error: string | null;
}

const StellarWalletContext = createContext<StellarWalletContextType | undefined>(undefined);

interface StellarWalletProviderProps {
  children: ReactNode;
}

export function StellarWalletProvider({ children }: StellarWalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const key = await getStellarPublicKey();
      if (key) {
        setPublicKey(key);
        setIsConnected(true);
      }
    } catch (error) {
      console.log("No existing Stellar wallet connection");
    }
  };

  const connect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await connectFreighter();

      if (result.success && result.publicKey) {
        setPublicKey(result.publicKey);
        setIsConnected(true);
      } else {
        setError(result.error || "Failed to connect to Stellar wallet");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setPublicKey(null);
    setIsConnected(false);
    setError(null);
  };

  const value: StellarWalletContextType = {
    isConnected,
    publicKey,
    connect,
    disconnect,
    isLoading,
    error,
  };

  return (
    <StellarWalletContext.Provider value={value}>
      {children}
    </StellarWalletContext.Provider>
  );
}

// Custom hook to use the Stellar wallet context
export function useStellarWallet() {
  const context = useContext(StellarWalletContext);
  if (context === undefined) {
    throw new Error("useStellarWallet must be used within a StellarWalletProvider");
  }
  return context;
}