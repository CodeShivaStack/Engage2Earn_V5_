import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet } from 'lucide-react';

export const WalletButton: React.FC = () => {
  const { connected } = useWallet();

  return (
    <div className="relative inline-block">
      <WalletMultiButton className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
        <Wallet className="w-5 h-5" />
        {connected ? 'Connected' : 'Connect Wallet'}
      </WalletMultiButton>
    </div>
  );
};