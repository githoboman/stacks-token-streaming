// Contract addresses - update these after deployment
export const STREAM_CONTRACT_ADDRESS = 'ST9NSDHK5969YF6WJ2MRCVVAVTDENWBNTFJRVZ3E';
export const STREAM_CONTRACT_NAME = 'stream';
export const ANALYTICS_CONTRACT_ADDRESS = 'ST9NSDHK5969YF6WJ2MRCVVAVTDENWBNTFJRVZ3E';
export const ANALYTICS_CONTRACT_NAME = 'stream-analytics';

// Network configurations
export const NETWORKS = {
  testnet: {
    name: 'testnet',
    url: 'https://api.testnet.hiro.so'
  },
  mainnet: {
    name: 'mainnet',
    url: 'https://api.hiro.so'
  }
};

// Contract function names
export const CONTRACT_FUNCTIONS = {
  STREAM_TO: 'stream-to',
  WITHDRAW: 'withdraw',
  REFUEL: 'refuel',
  CANCEL: 'cancel-stream',
  GET_BALANCE: 'balance-of',
  RECORD_STREAM_CREATION: 'record-stream-creation',
  RECORD_WITHDRAWAL: 'record-withdrawal',
  GET_GLOBAL_STATS: 'get-global-stats',
  GET_SENDER_STATS: 'get-sender-stats',
  GET_RECIPIENT_STATS: 'get-recipient-stats'
};