# Frontend Integration Example for LikeLotteryV2

This document provides example frontend code for integrating with the LikeLotteryV2 contract using the sign-nonce API and viem.

## API Compatibility

✅ **Confirmed**: The API implementation is fully compatible with the contract's signature verification system. viem's `signMessage` automatically applies the Ethereum signed message prefix (`"\x19Ethereum Signed Message:\n" + len(message) + message`), which matches exactly what the contract expects.

## Frontend Implementation

### 1. Install Dependencies

```bash
npm install viem @farcaster/frame-sdk
```

### 2. Environment Setup

```typescript
// lib/config.ts
import { base } from 'viem/chains';

export const CONTRACT_ADDRESS = '0x...'; // Your deployed contract address
export const API_BASE_URL = 'https://your-api.com'; // Your API base URL
export const CHAIN = base;
```

### 3. API Service

```typescript
// lib/api.ts
interface SignNonceResponse {
  success: boolean;
  nonce: string;
  signature: string;
  message: string;
  error?: string;
}

export class LotteryAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async signNonce(token: string): Promise<SignNonceResponse> {
    const response = await fetch(`${this.baseUrl}/sign-nonce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: window.location.origin,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }
}
```

### 4. Contract Interaction

```typescript
// lib/contract.ts
import { createPublicClient, createWalletClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { CONTRACT_ADDRESS } from './config';

const contractABI = parseAbi([
  'function yank(bytes32 nonceValue, bytes signature) external',
  'function crank(bytes32 nonceValue, bytes signature) external',
  'function isNonceUsed(bytes32 nonceValue) external view returns (bool)',
  'function yankLoopCount() external view returns (uint256)',
  'event Yank(address indexed drawnBy, bytes32 random)',
  'event Crank(address indexed user, uint256 indexed timestamp)',
]);

export class LotteryContract {
  private publicClient;
  private walletClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Initialize wallet client when user connects
    this.walletClient = null;
  }

  async connectWallet() {
    if (typeof window !== 'undefined' && window.ethereum) {
      const [account] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      this.walletClient = createWalletClient({
        account: account as `0x${string}`,
        chain: base,
        transport: http(),
      });
    }
  }

  async yank(nonce: string, signature: string) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    return this.walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: 'yank',
      args: [nonce as `0x${string}`, signature as `0x${string}`],
    });
  }

  async crank(nonce: string, signature: string) {
    if (!this.walletClient) {
      throw new Error('Wallet not connected');
    }

    return this.walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: 'crank',
      args: [nonce as `0x${string}`, signature as `0x${string}`],
    });
  }

  async isNonceUsed(nonce: string): Promise<boolean> {
    return this.publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: 'isNonceUsed',
      args: [nonce as `0x${string}`],
    });
  }

  async getYankLoopCount(): Promise<bigint> {
    return this.publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: 'yankLoopCount',
    });
  }
}
```
