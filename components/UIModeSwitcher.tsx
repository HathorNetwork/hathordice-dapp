'use client';

import { useState } from 'react';
import { toast } from '@/lib/toast';
import { WalletType } from '@/types/wallet';

export type UIMode = 'classic' | 'fortune-tiger';

interface UIModeSwitcherProps {
  currentMode: UIMode;
  onModeChange: (mode: UIMode) => void;
  balance?: string;
  onGetBalance?: () => void;
  isConnected?: boolean;
  isLoadingBalance?: boolean;
  walletType?: WalletType;
  contractBalance?: bigint;
  onWithdraw?: () => Promise<void>;
  isWithdrawing?: boolean;
}

export function UIModeSwitcher({ currentMode, onModeChange, balance, onGetBalance, isConnected, isLoadingBalance, walletType, contractBalance, onWithdraw, isWithdrawing }: UIModeSwitcherProps) {
  // If in fortune-tiger mode, show Statistics button with balance or Get Balance button
  // Hidden on mobile - mobile version is rendered inside FortuneTigerBetCard
  if (currentMode === 'fortune-tiger') {
    return (
      <div className="hidden md:flex fixed bottom-4 right-4 z-50 items-center gap-2">
        {balance ? (
          <>
            <div className="px-3 py-1.5 rounded-full border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-900/30 via-black/50 to-yellow-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <div className="text-sm">💰</div>
                <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 font-mono">
                  {balance}
                </span>
              </div>
            </div>
            {contractBalance && contractBalance > 0n && onWithdraw && (
              <button
                onClick={onWithdraw}
                disabled={isWithdrawing}
                className="px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white/90 hover:text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw gains'}
              </button>
            )}
          </>
        ) : isLoadingBalance ? (
          <div className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-300">
            Authorize to view balance
          </div>
        ) : (
          isConnected && onGetBalance && (
            <button
              onClick={() => {
                // Only show confirmation toast for WalletConnect (not MetaMask Snap)
                if (walletType !== 'metamask') {
                  toast.info('⏳ Please confirm the operation in your wallet...');
                }
                onGetBalance();
              }}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 text-yellow-900 hover:brightness-110 shadow-xl"
            >
              Load Balance
            </button>
          )
        )}
        <button
          onClick={() => onModeChange('classic')}
          className="px-4 py-1.5 rounded-full text-xs font-bold transition-all bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white/90 hover:text-white hover:bg-white/20"
        >
          Statistics
        </button>
      </div>
    );
  }

  // In classic mode, show Play button
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => onModeChange('fortune-tiger')}
        className="px-6 py-3 rounded-full text-sm font-bold transition-all bg-white/10 backdrop-blur-md border border-white/20 shadow-xl text-white/90 hover:text-white hover:bg-white/20"
      >
        Play
      </button>
    </div>
  );
}
