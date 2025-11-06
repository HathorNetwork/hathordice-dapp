import type { Metadata } from 'next';
import { WalletProvider } from '@/contexts/WalletContext';
import { HathorProvider } from '@/contexts/HathorContext';
import { WalletConnectProvider } from '@/contexts/WalletConnectContext';
import { WalletConnectInitializer } from '@/components/WalletConnectInitializer';
import { ToastProvider, Toaster } from '@/lib/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hathor Dice - Provably Fair Betting',
  description: 'Decentralized dice game on Hathor Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <WalletConnectInitializer>
            <WalletConnectProvider>
              <HathorProvider>
                <WalletProvider>
                  {children}
                  <Toaster position="top-right" />
                </WalletProvider>
              </HathorProvider>
            </WalletConnectProvider>
          </WalletConnectInitializer>
        </ToastProvider>
      </body>
    </html>
  );
}
