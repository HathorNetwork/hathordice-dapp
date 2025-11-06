# Hathor Dice dApp

A decentralized dice betting game built on Hathor Network using Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎲 Provably fair dice betting
- 💰 Wallet connection and balance management
- 💧 Liquidity pool participation
- 📊 Real-time bet history
- 🎯 Flexible betting modes (threshold or win chance)
- 🪙 Multi-token support

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Header.tsx         # Header with wallet connection
│   ├── BalanceCard.tsx    # User balance display
│   ├── RecentBetsTable.tsx # Bet history table
│   ├── TokenSelector.tsx  # Token selection dropdown
│   ├── PlaceBetCard.tsx   # Bet placement interface
│   ├── AddLiquidityCard.tsx
│   ├── RemoveLiquidityCard.tsx
│   └── WithdrawCard.tsx
├── contexts/              # React contexts
│   └── WalletContext.tsx  # Wallet state management
├── lib/                   # Utility functions
│   └── utils.ts           # Game calculations
└── types/                 # TypeScript types
    └── index.ts           # Type definitions
```

## Game Mechanics

- **House Edge**: 2%
- **Threshold Range**: 1 - 65,535
- **Multiplier Formula**: `(65,536 / threshold) × (1 - house_edge)`
- **Win Condition**: Random number ≤ threshold

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- React Context API
