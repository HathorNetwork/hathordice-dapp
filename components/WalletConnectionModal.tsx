'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWalletConnect } from '@/contexts/WalletConnectContext';
import { useState, useEffect } from 'react';

interface WalletConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectionModal({ open, onOpenChange }: WalletConnectionModalProps) {
  const { connect, isInitializing } = useWalletConnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setIsConnecting(false);
      setError(null);
    }
  }, [open]);

  const handleReownConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await connect();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to connect via Reown:', error);
      if (error?.message?.includes('not initialized yet')) {
        setError('Wallet is initializing. Please wait a moment and try again.');
      } else {
        setError('Failed to connect. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMetamaskConnect = async () => {
    setError('Metamask Snaps integration coming soon!');
  };

  const isButtonDisabled = isConnecting || isInitializing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred wallet connection method
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {isInitializing && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-400">
              Initializing wallet connection...
            </div>
          )}
          <Button
            onClick={handleReownConnect}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
            disabled={isButtonDisabled}
          >
            <span className="text-xl">👛</span>
            {isConnecting ? 'Connecting...' : isInitializing ? 'Initializing...' : 'Connect via Reown'}
          </Button>
          <Button
            onClick={handleMetamaskConnect}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
            disabled={true}
          >
            <span className="text-xl">🦊</span>
            Connect via Metamask Snaps (Coming Soon)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
