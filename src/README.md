# Stacks Token Streaming Frontend

A React-based frontend for the Stacks Token Streaming platform with analytics and reputation tracking.

## Features

- **Wallet Integration**: Connect with Hiro wallet for seamless Stacks transactions
- **Token Streaming**: Create, manage, and withdraw from STX streams
- **Analytics Dashboard**: View global statistics and personal metrics
- **Reputation System**: Rate users and track reputation scores
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **@stacks/connect** - Wallet connection and transaction signing
- **@stacks/transactions** - Stacks blockchain interactions
- **@stacks/network** - Network configuration

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Hiro wallet extension

### Installation

1. Navigate to the frontend directory:
```bash
cd src
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── WalletConnect.jsx      # Wallet connection component
│   ├── StreamDashboard.jsx    # Main streaming interface
│   ├── StreamForm.jsx         # Form for creating streams
│   ├── StreamList.jsx         # List of user's streams
│   ├── StreamCard.jsx         # Individual stream display
│   └── AnalyticsDashboard.jsx # Analytics and statistics
├── utils/
│   └── constants.js           # Contract addresses and constants
├── App.jsx                    # Main app component
├── App.css                    # Global styles
├── main.jsx                   # App entry point
└── public/
    └── manifest.json          # PWA manifest
```

## Contract Integration

The frontend interacts with two main contracts:

### Stream Contract (`stream.clar`)
- `stream-to`: Create a new token stream
- `withdraw`: Withdraw available tokens
- `refuel`: Add more tokens to a stream
- `balance-of`: Check stream balance

### Analytics Contract (`stream-analytics.clar`)
- `record-stream-creation`: Track new streams
- `record-withdrawal`: Track withdrawals
- `get-global-stats`: Get network statistics
- `get-sender-stats`: Get sender metrics
- `get-recipient-stats`: Get recipient metrics
- `rate-user`: Rate another user

## Configuration

Update contract addresses in `src/utils/constants.js` after deployment:

```javascript
export const STREAM_CONTRACT_ADDRESS = 'DEPLOYED_CONTRACT_ADDRESS';
export const ANALYTICS_CONTRACT_ADDRESS = 'DEPLOYED_CONTRACT_ADDRESS';
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve with Hiro wallet
2. **Create Stream**: Fill out the stream form with recipient address, amount, and block range
3. **Manage Streams**: View your active streams and withdraw available tokens
4. **View Analytics**: Switch to the Analytics tab to see network statistics and your metrics
5. **Rate Users**: After stream completion, rate your streaming partners

## Network Support

- **Testnet**: Currently configured for Stacks testnet
- **Mainnet**: Update network configuration in components for mainnet deployment

## Contributing

1. Test all wallet interactions thoroughly
2. Ensure responsive design works on mobile
3. Add proper error handling for failed transactions
4. Update contract addresses after deployment

## License

ISC License