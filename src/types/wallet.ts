import { PublicKey } from '@solana/web3.js';

export interface WalletContextState {
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  disconnecting: boolean;
  select: (walletName: string) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export interface UserProfile {
  walletAddress: string;
  username: string | null;
  socialAccounts: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
  tokenBalance: number;
  reputation: number;
}