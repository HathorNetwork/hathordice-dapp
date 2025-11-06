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
  const { connect } = useWalletConnect();
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
    } catch (error) {
      console.error('Failed to connect via Reown:', error);
      setError('Failed to connect. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleMetamaskConnect = async () => {
    setError('Metamask Snaps integration coming soon!');
  };

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
          <Button
            onClick={handleReownConnect}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
            disabled={isConnecting}
          >
            <span className="text-xl">👛</span>
            {isConnecting ? 'Connecting...' : 'Connect via Reown'}
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
