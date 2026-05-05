"use client";

import { useWallet } from "@/hooks/useWallet";
import { NeonButton } from "./NeonButton";
import { useState } from "react";

export function WalletButton() {
  const { account, connect, disconnect, network, error } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/50 font-mono">
          {network && <span className="text-purple-400 mr-1">{network}</span>}
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <NeonButton variant="secondary" onClick={() => { void disconnect(); }}>
          Disconnect
        </NeonButton>
      </div>
    );
  }

  return (
    <>
      <NeonButton onClick={() => setShowModal(true)}>
        🔗 Connect Wallet
      </NeonButton>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0d1117] border border-white/20 rounded-2xl p-6 w-80 space-y-4">
            <h3 className="text-white font-semibold text-lg">Connect Wallet</h3>
            <p className="text-white/50 text-sm">Choose your wallet provider</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => { void connect("metamask"); setShowModal(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
              >
                <span className="text-2xl">🦊</span>
                <div>
                  <p className="text-white font-medium text-sm">MetaMask</p>
                  <p className="text-white/40 text-xs">EVM compatible</p>
                </div>
              </button>

              <button
                onClick={() => { void connect("phantom"); setShowModal(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
              >
                <span className="text-2xl">👻</span>
                <div>
                  <p className="text-white font-medium text-sm">Phantom</p>
                  <p className="text-white/40 text-xs">Solana compatible</p>
                </div>
              </button>
            </div>

            <NeonButton variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </NeonButton>
          </div>
        </div>
      )}
    </>
  );
}
