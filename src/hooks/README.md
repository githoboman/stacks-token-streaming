# Stacks Streaming App Hooks

This directory contains custom React hooks for interacting with the Stacks Token Streaming platform. These hooks provide a clean, reusable interface for wallet management, contract interactions, and application state.

## Overview

The hooks are designed to work together to provide a complete streaming application experience:

- **`useWallet`** - Hiro wallet authentication and user management
- **`useStreamContract`** - Stream contract interactions (create, withdraw, refuel)
- **`useAnalyticsContract`** - Analytics contract interactions (record events, query stats)
- **`useStreamingApp`** - Unified hook combining all functionality

## Hook Details

### `useWallet`

Manages Hiro wallet connection and user session state.

```javascript
const {
  // State
  userData,
  loading,
  error,

  // Authentication
  connectWallet,
  disconnectWallet,
  isSignedIn,
  isSignInPending,

  // User Data
  getStxAddress,
  getUserProfile,
  getWalletInfo,

  // Utilities
  clearError
} = useWallet();
```

**Key Functions:**
- `connectWallet()` - Initiate wallet connection
- `disconnectWallet()` - Sign out user
- `getStxAddress(network)` - Get user's STX address
- `getWalletInfo()` - Get formatted wallet display data

### `useStreamContract`

Handles all interactions with the Stream contract.

```javascript
const {
  // State
  loading,
  error,

  // Actions
  createStream,
  withdrawFromStream,
  refuelStream,

  // Queries
  getStreamBalance,
  getCurrentBlockHeight,
  calculateBlockDelta,

  // Utilities
  clearError
} = useStreamContract(network);
```

**Key Functions:**
- `createStream(streamData)` - Create new token stream
- `withdrawFromStream(streamId)` - Withdraw available tokens
- `refuelStream(streamId, amount)` - Add tokens to stream
- `getStreamBalance(streamId, address)` - Check stream balance
- `getCurrentBlockHeight()` - Get current block height

### `useAnalyticsContract`

Manages analytics contract interactions for tracking and reputation.

```javascript
const {
  // State
  loading,
  error,

  // Recording Actions
  recordStreamCreation,
  recordWithdrawal,
  recordStreamCompletion,
  recordStreamCancellation,
  rateUser,

  // Query Functions
  getGlobalStats,
  getSenderStats,
  getRecipientStats,
  getStreamRecord,
  calculateSenderReliability,
  calculateRecipientEngagement,
  getCurrentPeriod,

  // Utilities
  clearError
} = useAnalyticsContract(network);
```

**Key Functions:**
- `recordStreamCreation(...)` - Track new stream creation
- `rateUser(ratedUser, streamId, rating)` - Rate a user (1-5 stars)
- `getGlobalStats()` - Get network-wide statistics
- `getSenderStats(address)` - Get sender analytics
- `getRecipientStats(address)` - Get recipient analytics

### `useStreamingApp`

Unified hook that combines wallet, streaming, and analytics functionality.

```javascript
const {
  // Wallet state and functions
  wallet: {
    connectWallet,
    disconnectWallet,
    getWalletInfo,
    isSignedIn,
    // ... other wallet properties
  },

  // Streaming functions
  streaming: {
    createStream,
    withdrawFromStream,
    refuelStream,
    getStreamBalance,
    getCurrentBlockHeight
  },

  // Analytics functions
  analytics: {
    rateUser,
    refreshAnalytics,
    getSenderReliability,
    getRecipientEngagement,
    data: analyticsData,
    userStats
  },

  // Application state
  state: {
    streams,
    isLoading,
    error
  },

  // Utility functions
  utils: {
    clearError
  }
} = useStreamingApp();
```

## Usage Examples

### Basic Wallet Connection

```javascript
import { useStreamingApp } from '../hooks/useStreamingApp';

function MyComponent() {
  const { wallet, state } = useStreamingApp();

  if (!wallet.isSignedIn) {
    return (
      <button onClick={wallet.connectWallet}>
        Connect Wallet
      </button>
    );
  }

  const walletInfo = wallet.getWalletInfo();
  return (
    <div>
      <p>Connected: {walletInfo.shortAddress}</p>
      <button onClick={wallet.disconnectWallet}>
        Disconnect
      </button>
    </div>
  );
}
```

### Creating a Stream

```javascript
import { useStreamingApp } from '../hooks/useStreamingApp';

function StreamCreator() {
  const { streaming, state } = useStreamingApp();

  const handleCreateStream = async () => {
    try {
      await streaming.createStream({
        recipient: 'ST123...',
        amount: 1000000, // 1 STX
        startBlock: 1000,
        endBlock: 2000,
        paymentPerBlock: 500
      });
      console.log('Stream created!');
    } catch (error) {
      console.error('Failed to create stream:', error);
    }
  };

  return (
    <button onClick={handleCreateStream} disabled={state.isLoading}>
      {state.isLoading ? 'Creating...' : 'Create Stream'}
    </button>
  );
}
```

### Viewing Analytics

```javascript
import { useStreamingApp } from '../hooks/useStreamingApp';

function AnalyticsView() {
  const { analytics, state } = useStreamingApp();

  if (state.isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      <h3>Global Stats</h3>
      <p>Total Streams: {analytics.data?.totalStreams || 0}</p>
      <p>Total Volume: {analytics.data?.totalVolume || 0} STX</p>

      <h3>Your Stats</h3>
      <p>Reputation: {analytics.userStats?.sender?.reputationScore || 50}/100</p>
    </div>
  );
}
```

## Error Handling

All hooks provide error states and clearing functions:

```javascript
const { error, clearError } = useStreamingApp();

// Display error
{error && (
  <div className="error">
    <p>{error}</p>
    <button onClick={clearError}>Dismiss</button>
  </div>
)}
```

## Network Configuration

Hooks accept a `network` parameter for testnet/mainnet switching:

```javascript
import { Network } from '@stacks/network';

const testnet = new Network({ name: 'testnet' });
const mainnet = new Network({ name: 'mainnet' });

// Use testnet for development
const { streaming } = useStreamContract(testnet);
```

## Best Practices

1. **Error Handling**: Always check for errors and provide user feedback
2. **Loading States**: Show loading indicators during async operations
3. **Network Awareness**: Use appropriate network for testnet/mainnet
4. **State Management**: Use the combined `useStreamingApp` hook for complex components
5. **Contract Addresses**: Update addresses in `src/utils/constants.js` after deployment

## Dependencies

- `@stacks/connect` - Wallet connection
- `@stacks/connect-react` - React wallet hooks
- `@stacks/transactions` - Blockchain transactions
- `@stacks/network` - Network configuration

## Testing

Hooks can be tested by mocking the network and contract calls:

```javascript
import { renderHook } from '@testing-library/react';
import { useStreamContract } from './useStreamContract';

const mockNetwork = { /* mock network */ };

test('creates stream successfully', async () => {
  const { result } = renderHook(() => useStreamContract(mockNetwork));

  // Test implementation
});