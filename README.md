# Stacks Token Streaming

A comprehensive token streaming platform on the Stacks blockchain with analytics, reputation tracking, and a full-featured React frontend.

## Overview

This project implements a decentralized token streaming protocol similar to Ethereum's Sablier, but built on Stacks. It includes:

- **Core Streaming Contract**: Create and manage STX token streams
- **Analytics Contract**: Track metrics, reputation, and network statistics
- **React Frontend**: User-friendly interface with wallet integration
- **Comprehensive Tests**: Full test coverage for all contracts

## Features

### Core Functionality
- ⏰ **Time-based Streaming**: Stream STX tokens over specified block ranges
- 💰 **Flexible Payments**: Set custom payment rates per block
- 🔄 **Refuel Streams**: Add more tokens to active streams
- 💸 **Withdraw Anytime**: Recipients can withdraw available tokens
- 🏁 **Stream Completion**: Automatic completion when time period ends

### Analytics & Reputation
- 📊 **Global Statistics**: Network-wide streaming metrics
- 👤 **User Profiles**: Individual sender/recipient statistics
- ⭐ **Reputation System**: Rate users after stream completion
- 🏆 **Leaderboards**: Top performers by volume
- 📈 **Time-based Analytics**: Historical metrics by period

### Frontend Features
- 🔗 **Wallet Integration**: Connect with Hiro wallet
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **Modern UI**: Clean, intuitive interface
- ⚡ **Real-time Updates**: Live transaction status
- 📊 **Analytics Dashboard**: Visual metrics and statistics

## Project Structure

```
stacks-token-streaming/
├── contracts/
│   ├── stream.clar              # Core streaming contract
│   └── stream-analytics.clar    # Analytics and reputation
├── tests/
│   ├── stream.test.ts           # Stream contract tests
│   └── stream-analytics.test.ts # Analytics contract tests
├── src/                         # React frontend
│   ├── components/              # UI components
│   ├── utils/                   # Constants and utilities
│   └── public/                  # Static assets
├── deployments/                 # Deployment configurations
└── Clarinet.toml               # Project configuration
```

## Quick Start

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) - Stacks development environment
- [Node.js](https://nodejs.org/) 16+
- [Hiro Wallet](https://wallet.hiro.so/) - For frontend interactions

### 1. Clone and Setup

```bash
git clone <repository-url>
cd stacks-token-streaming
```

### 2. Install Dependencies

```bash
# Install Clarinet dependencies
npm install

# Install frontend dependencies
cd src && npm install && cd ..
```

### 3. Run Tests

```bash
npm test
```

### 4. Deploy to Testnet

```bash
clarinet deployments apply --testnet
```

### 5. Start Frontend

```bash
cd src
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## Contracts

### Stream Contract

**Functions:**
- `stream-to`: Create a new token stream
- `withdraw`: Withdraw available tokens
- `refuel`: Add more tokens to a stream
- `balance-of`: Check stream balance
- `update-details`: Modify stream parameters (with signatures)

### Analytics Contract

**Functions:**
- `record-stream-creation`: Track new streams
- `record-withdrawal`: Track withdrawals
- `record-stream-completion`: Mark streams as completed
- `rate-user`: Rate another user (1-5 stars)
- `get-global-stats`: Get network statistics
- `get-sender-stats`: Get sender metrics
- `get-recipient-stats`: Get recipient metrics

## Frontend Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve with Hiro wallet
2. **Create Stream**:
   - Enter recipient address
   - Set total amount and payment rate
   - Specify start and end blocks
3. **Manage Streams**: View active streams and withdraw tokens
4. **View Analytics**: Check network stats and personal metrics
5. **Rate Users**: Rate streaming partners after completion

## Configuration

### Contract Addresses

After deployment, update addresses in `src/utils/constants.js`:

```javascript
export const STREAM_CONTRACT_ADDRESS = 'DEPLOYED_ADDRESS';
export const ANALYTICS_CONTRACT_ADDRESS = 'DEPLOYED_ADDRESS';
```

### Network Configuration

Switch between testnet and mainnet in the components by updating the network parameter.

## Testing

### Contract Tests

```bash
npm test              # Run all tests
npm run test:report   # Run with coverage
npm run test:watch    # Watch mode
```

### Frontend Tests

```bash
cd src
npm test
```

## Deployment

### Testnet

```bash
clarinet deployments apply --testnet
```

### Mainnet

```bash
clarinet deployments apply --mainnet
```

## Architecture

### Smart Contracts

- **Clarity Language**: Stacks smart contract language
- **Version 3**: Latest Clarity features
- **Modular Design**: Separate contracts for streaming and analytics

### Frontend

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Stacks.js**: Official Stacks JavaScript libraries
- **Responsive**: Mobile-first design

### Security

- **Access Controls**: Proper authorization checks
- **Input Validation**: Comprehensive parameter validation
- **Signature Verification**: Secure stream modifications
- **Overflow Protection**: Safe arithmetic operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC License - see LICENSE file for details

## Support

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Hiro Wallet](https://wallet.hiro.so/)