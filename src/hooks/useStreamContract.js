import { useState, useCallback } from 'react';
import {
  callReadOnlyFunction,
  contractPrincipalCV,
  uintCV,
  tupleCV,
  openContractCall
} from '@stacks/transactions';
import { useConnect } from '@stacks/connect-react';
import {
  STREAM_CONTRACT_ADDRESS,
  STREAM_CONTRACT_NAME,
  CONTRACT_FUNCTIONS
} from '../utils/constants';

/**
 * Custom hook for interacting with the Stream contract
 * Provides functions to create, manage, and query token streams
 */
export const useStreamContract = (network) => {
  const { doOpenAuth } = useConnect();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new token stream
   * @param {Object} streamData - Stream parameters
   * @param {string} streamData.recipient - Recipient address
   * @param {number} streamData.amount - Total amount to stream
   * @param {number} streamData.startBlock - Starting block height
   * @param {number} streamData.endBlock - Ending block height
   * @param {number} streamData.paymentPerBlock - STX per block
   */
  const createStream = useCallback(async (streamData) => {
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [
        contractPrincipalCV(streamData.recipient),
        uintCV(streamData.amount),
        tupleCV({
          'start-block': uintCV(streamData.startBlock),
          'stop-block': uintCV(streamData.endBlock)
        }),
        uintCV(streamData.paymentPerBlock)
      ];

      const options = {
        contractAddress: STREAM_CONTRACT_ADDRESS,
        contractName: STREAM_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.STREAM_TO,
        functionArgs,
        network,
        appDetails: {
          name: 'Stacks Token Streaming',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Stream created successfully:', data);
          setLoading(false);
        },
        onCancel: () => {
          console.log('Stream creation cancelled');
          setLoading(false);
        },
      };

      await openContractCall(options);
    } catch (err) {
      console.error('Error creating stream:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [network]);

  /**
   * Withdraw available tokens from a stream
   * @param {number} streamId - ID of the stream
   */
  const withdrawFromStream = useCallback(async (streamId) => {
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [uintCV(streamId)];

      const options = {
        contractAddress: STREAM_CONTRACT_ADDRESS,
        contractName: STREAM_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.WITHDRAW,
        functionArgs,
        network,
        appDetails: {
          name: 'Stacks Token Streaming',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Withdrawal successful:', data);
          setLoading(false);
        },
        onCancel: () => {
          console.log('Withdrawal cancelled');
          setLoading(false);
        },
      };

      await openContractCall(options);
    } catch (err) {
      console.error('Error withdrawing from stream:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [network]);

  /**
   * Refuel a stream with additional tokens
   * @param {number} streamId - ID of the stream
   * @param {number} amount - Additional amount to add
   */
  const refuelStream = useCallback(async (streamId, amount) => {
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [uintCV(streamId), uintCV(amount)];

      const options = {
        contractAddress: STREAM_CONTRACT_ADDRESS,
        contractName: STREAM_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.REFUEL,
        functionArgs,
        network,
        appDetails: {
          name: 'Stacks Token Streaming',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Stream refueled successfully:', data);
          setLoading(false);
        },
        onCancel: () => {
          console.log('Refuel cancelled');
          setLoading(false);
        },
      };

      await openContractCall(options);
    } catch (err) {
      console.error('Error refueling stream:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [network]);

  /**
   * Get stream balance information
   * @param {number} streamId - ID of the stream
   * @param {string} who - Address to check balance for
   * @returns {Promise<Object>} Balance information
   */
  const getStreamBalance = useCallback(async (streamId, who) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: STREAM_CONTRACT_ADDRESS,
        contractName: STREAM_CONTRACT_NAME,
        functionName: 'balance-of',
        functionArgs: [uintCV(streamId), contractPrincipalCV(who)],
        network,
        senderAddress: who,
      });

      return result.value;
    } catch (err) {
      console.error('Error getting stream balance:', err);
      throw err;
    }
  }, [network]);

  /**
   * Get current block height
   * @returns {Promise<number>} Current block height
   */
  const getCurrentBlockHeight = useCallback(async () => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: STREAM_CONTRACT_ADDRESS,
        contractName: STREAM_CONTRACT_NAME,
        functionName: 'current-block-height',
        functionArgs: [],
        network,
        senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // dummy address
      });

      return result.value.value;
    } catch (err) {
      console.error('Error getting block height:', err);
      // Fallback to a reasonable default
      return 0;
    }
  }, [network]);

  /**
   * Calculate block delta for a timeframe
   * @param {Object} timeframe - Start and stop blocks
   * @returns {Promise<number>} Number of active blocks
   */
  const calculateBlockDelta = useCallback(async (timeframe) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: STREAM_CONTRACT_ADDRESS,
        contractName: STREAM_CONTRACT_NAME,
        functionName: 'calculate-block-delta',
        functionArgs: [tupleCV({
          'start-block': uintCV(timeframe.startBlock),
          'stop-block': uintCV(timeframe.endBlock)
        })],
        network,
        senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // dummy address
      });

      return result.value.value;
    } catch (err) {
      console.error('Error calculating block delta:', err);
      throw err;
    }
  }, [network]);

  return {
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
    clearError: () => setError(null)
  };
};