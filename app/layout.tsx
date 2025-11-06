import type { Metadata } from 'next';
import { WalletProvider } from '@/contexts/WalletContext';
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
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
