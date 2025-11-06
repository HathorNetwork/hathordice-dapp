# HathorDice DApp

A decentralized dice betting game built on the Hathor Network using Nano Contracts. This DApp allows users to place bets, provide liquidity, and interact with the HathorDice smart contract.

## Features

- **Place Bets**: Bet HTR tokens with customizable win chances and thresholds
- **Liquidity Provision**: Add or remove liquidity from the contract pool
- **Wallet Integration**: Connect via Reown or Metamask Snaps
- **Network Support**: India Testnet (Mainnet coming soon)
- **Real-time Contract State**: View current contract parameters and liquidity
- **Mock Mode**: Test the UI without connecting a real wallet

## Architecture

### Core Components

1. **Hathor RPC Service** (`lib/hathorRPC.ts`)
   - Implements the Hathor wallet-to-DApp RPC API
   - Supports mock mode for development
   - Methods: `htr_getConnectedNetwork`, `htr_getBalance`, `htr_getAddress`, `htr_sendNanoContractTx`

2. **Hathor Core API** (`lib/hathorCoreAPI.ts`)
   - Fetches blockchain data from Hathor nodes
   - Methods: `getBlueprintInfo`, `getContractState`, `getContractHistory`, `getTransaction`

3. **Hathor Context** (`contexts/HathorContext.tsx`)
   - Manages wallet connection state
   - Provides contract state to components
   - Handles bet placement and network switching

### Contract Integration

The DApp integrates with the HathorDice Nano Contract which includes:

- **Token UID**: The token used for betting (default: HTR)
- **House Edge**: Configurable house edge in basis points (e.g., 200 = 2%)
- **Max Bet Amount**: Maximum allowed bet per transaction
- **Random Bit Length**: Number of bits for random number generation (16-32)
- **Liquidity Pool**: Total liquidity provided by users

### Key Features

#### Dynamic Calculations

All bet calculations use contract parameters:
- Multiplier: `(2^randomBitLength / threshold) * (1 - houseEdge)`
- Payout: `(betAmount * 2^randomBitLength * (10000 - houseEdgeBasisPoints)) / (10000 * threshold)`
- Win Chance: `(threshold / 2^randomBitLength) * 100`

#### Network Configuration

Configure networks via environment variables:
```env
NEXT_PUBLIC_USE_MOCK_WALLET=true
NEXT_PUBLIC_DEFAULT_NETWORK=india-testnet
NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET=https://node1.india-testnet.hathor.network/v1a
NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET=https://node1.mainnet.hathor.network/v1a
NEXT_PUBLIC_CONTRACT_IDS=["contract_id_1","contract_id_2"]
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Hathor wallet (Hathor Wallet or Metamask with Hathor Snap)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hathordice-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
- Set `NEXT_PUBLIC_USE_MOCK_WALLET=false` for production
- Add your contract IDs to `NEXT_PUBLIC_CONTRACT_IDS`
- Configure network URLs if using custom nodes

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Mock Mode (Development)

For testing without a wallet:
```env
NEXT_PUBLIC_USE_MOCK_WALLET=true
```

Mock mode simulates:
- Wallet connection
- Balance queries
- Transaction submissions
- Network information

## Usage

### Connecting a Wallet

1. Click "Connect Wallet" in the header
2. Choose connection method:
   - **Reown**: For Hathor Wallet integration
   - **Metamask Snaps**: For Metamask users

### Placing a Bet

1. Ensure wallet is connected
2. Select bet amount (respects max bet limit)
3. Choose win chance or threshold:
   - **Win Chance**: Set percentage (1-99%)
   - **Threshold**: Set raw threshold value
4. Review multiplier and potential payout
5. Click "Place Bet"

### Adding Liquidity

1. Navigate to "Add Liquidity" card
2. Enter amount to deposit
3. Confirm transaction
4. Receive liquidity provider tokens

### Removing Liquidity

1. Navigate to "Remove Liquidity" card
2. Enter amount to withdraw
3. Confirm transaction
4. Receive HTR tokens back

## Contract Methods

### `place_bet(bet_amount: int, threshold: int)`
Place a bet with specified amount and threshold.

**Parameters:**
- `bet_amount`: Amount to bet (in cents)
- `threshold`: Win threshold (1 to 2^randomBitLength - 1)

**Actions:**
- Deposit: Bet amount in contract token

### `add_liquidity()`
Add liquidity to the contract pool.

**Actions:**
- Deposit: Amount to add as liquidity

### `remove_liquidity()`
Remove liquidity from the contract pool.

**Actions:**
- Withdrawal: Amount to remove

### `claim_balance()`
Claim winnings from contract balance.

**Actions:**
- Withdrawal: Amount to claim

## API Reference

### Hathor RPC Methods

#### `htr_getConnectedNetwork()`
Returns the network the wallet is connected to.

#### `htr_getBalance(params)`
Get balance for specified tokens.

#### `htr_getAddress(params)`
Get wallet address.

#### `htr_sendNanoContractTx(params)`
Send a nano contract transaction.

### Hathor Core API Methods

#### `getBlueprintInfo(blueprintId)`
Fetch blueprint information.

#### `getContractState(contractId)`
Fetch current contract state.

#### `getContractHistory(contractId, limit)`
Fetch contract transaction history.

## Project Structure

```
hathordice-dapp/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Header with wallet connection
│   ├── PlaceBetCard.tsx    # Bet placement interface
│   ├── AddLiquidityCard.tsx
│   ├── RemoveLiquidityCard.tsx
│   ├── WithdrawCard.tsx
│   ├── ContractInfoPanel.tsx
│   ├── NetworkSelector.tsx
│   ├── WalletConnectionModal.tsx
│   └── ui/                 # UI components
├── contexts/
│   ├── HathorContext.tsx   # Hathor wallet & contract state
│   └── WalletContext.tsx   # Legacy wallet context
├── lib/
│   ├── config.ts           # Environment configuration
│   ├── hathorRPC.ts        # RPC service
│   ├── hathorCoreAPI.ts    # Core API service
│   ├── utils.ts            # Utility functions
│   └── toast.tsx           # Toast notifications
├── types/
│   └── hathor.ts           # TypeScript types
└── .env.local              # Environment variables
```

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Wallet Not Connecting

1. Ensure you're on the correct network (India Testnet)
2. Check that your wallet extension is installed and unlocked
3. Try refreshing the page
4. Check browser console for errors

### Transaction Failing

1. Verify sufficient balance
2. Check bet amount doesn't exceed max bet
3. Ensure contract has sufficient liquidity
4. Verify network connection

### Contract State Not Loading

1. Check network configuration in `.env.local`
2. Verify contract ID is correct
3. Ensure node URL is accessible
4. Check browser console for API errors

## Security Considerations

- Never commit `.env.local` with real contract IDs
- Always verify transaction details before signing
- Use testnet for development and testing
- Audit smart contracts before mainnet deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Hathor Documentation: https://docs.hathor.network
- Hathor Discord: https://discord.gg/hathor

## Roadmap

- [ ] Mainnet support
- [ ] Multi-token support
- [ ] Advanced statistics dashboard
- [ ] Leaderboard
- [ ] Social features
- [ ] Mobile app

---

Built with ❤️ on Hathor Network
