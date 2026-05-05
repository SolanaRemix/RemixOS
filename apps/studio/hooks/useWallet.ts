"use client";

import { useState, useCallback } from "react";

interface WalletState {
  account: string | null;
  network: string | null;
  connect: (provider: "metamask" | "phantom") => Promise<void>;
  disconnect: () => Promise<void>;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
    solana?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      isPhantom?: boolean;
    };
  }
}

export function useWallet(): WalletState {
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  const connect = useCallback(async (provider: "metamask" | "phantom") => {
    if (provider === "metamask") {
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];
      if (accounts.length > 0 && accounts[0]) {
        setAccount(accounts[0]);
        setNetwork("EVM");
      }
    } else if (provider === "phantom") {
      if (!window.solana?.isPhantom) {
        alert("Phantom wallet not detected. Please install Phantom.");
        return;
      }
      const resp = await window.solana.connect();
      setAccount(resp.publicKey.toString());
      setNetwork("Solana");
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (network === "Solana" && window.solana) {
      await window.solana.disconnect();
    }
    setAccount(null);
    setNetwork(null);
  }, [network]);

  return { account, network, connect, disconnect };
}
