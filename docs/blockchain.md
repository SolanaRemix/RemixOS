# RemixOS — Blockchain Guide

## Overview

RemixOS ships a first-class Web3 execution layer — **TradeOS** — that enables generated apps to interact with on-chain contracts without leaving the Studio environment.

---

## Supported Networks

| Network | Type | Status |
|---------|------|--------|
| Solana Mainnet | SVM | ✅ |
| Solana Devnet | SVM (test) | ✅ |
| Ethereum Mainnet | EVM | ✅ |
| BASE | EVM L2 | ✅ |
| Any EVM-compatible | EVM | ✅ |

---

## Supported Wallets

| Wallet | Network | Detection |
|--------|---------|-----------|
| Phantom | Solana | `window.solana?.isPhantom` |
| MetaMask | EVM | `window.ethereum` |
| WalletConnect | EVM + Solana | Modal |
| Solflare | Solana | `window.solflare?.isSolflare` |
| Backpack | Solana + EVM | `window.backpack` |

---

## Wallet Hook

Located at `apps/studio/hooks/useWallet.ts`:

```typescript
import { useWallet } from "@/hooks/useWallet";

const { connect, disconnect, account, network, error } = useWallet();

// Connect MetaMask
await connect("metamask");

// Connect Phantom
await connect("phantom");

// account = "0x..." (EVM) or "AbCd..." (Solana base58 public key)
// network = "EVM" | "Solana"
```

The hook keeps the wallet error visible until the user dismisses it — errors are never silently swallowed.

---

## Transaction Safety

Every on-chain action requires explicit user confirmation:

1. The UI presents a transaction summary modal before signing
2. The user must click **Confirm** to proceed
3. On error, the modal stays open with the error message (not silently dismissed)
4. On success, the `txHash` is returned for tracking

---

## Solana Integration

```typescript
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

const connection = new Connection(
  process.env["NEXT_PUBLIC_SOLANA_RPC"] ?? "https://api.mainnet-beta.solana.com"
);

// Send a transaction via Phantom
const tx = new Transaction().add(/* your instructions */);
const { blockhash } = await connection.getLatestBlockhash();
tx.recentBlockhash = blockhash;
tx.feePayer = new PublicKey(account);

const signed = await window.solana!.signTransaction(tx);
const txid = await connection.sendRawTransaction(signed.serialize());
await connection.confirmTransaction(txid);
```

---

## EVM Integration

```typescript
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum!);
const signer = await provider.getSigner();

const contract = new ethers.Contract(contractAddress, abi, signer);
const tx = await contract.someMethod(arg1, arg2);
await tx.wait();
```

---

## Smart Contract Scaffold

RemixOS can generate Solidity contract scaffolds from natural language:

**Prompt example:**
> Generate a Solidity ERC-20 token contract called "RemixToken" with symbol "RMX", 18 decimals, and a 1 billion total supply.

The Builder agent generates the contract code, and the deploy UI allows one-click deployment via MetaMask or WalletConnect.

---

## SPL Token Launcher

Coming in a future release. Will support:
- Create new SPL token
- Set metadata (name, symbol, URI)
- Mint supply
- Create liquidity pool (via Raydium / Orca)

---

## NFT Deployment

Coming in a future release. Will support:
- Metaplex NFT creation
- Collection deployment
- Royalty configuration

---

## RPC Configuration

Set your Solana RPC endpoint:
```env
NEXT_PUBLIC_SOLANA_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

Recommended providers:
- [Helius](https://helius.dev) — Solana-optimised, high performance
- [QuickNode](https://quicknode.com) — Multi-chain
- [Alchemy](https://alchemy.com) — EVM + Solana

---

## App NFT Registry

On-chain app registry (roadmap): register, version, and transfer generated apps as NFTs on Solana. Each generated website can be minted as an NFT with its source in metadata, enabling:
- Provable ownership
- Monetisation (resale, licensing)
- Version history on-chain
- DAO governance of popular templates
