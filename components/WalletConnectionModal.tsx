'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WalletConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: () => Promise<void>;
}

export function WalletConnectionModal({ open, onOpenChange, onConnect }: WalletConnectionModalProps) {
  const handleReownConnect = async () => {
    try {
      await onConnect();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to connect via Reown:', error);
    }
  };

  const handleMetamaskConnect = async () => {
    try {
      await onConnect();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to connect via Metamask Snaps:', error);
    }
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
          <Button
            onClick={handleReownConnect}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <span className="text-xl">👛</span>
            Connect via Reown
          </Button>
          <Button
            onClick={handleMetamaskConnect}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <span className="text-xl">🦊</span>
            Connect via Metamask Snaps
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
