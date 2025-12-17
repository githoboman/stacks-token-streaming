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
  ANALYTICS_CONTRACT_ADDRESS,
  ANALYTICS_CONTRACT_NAME,
  CONTRACT_FUNCTIONS
} from '../utils/constants';

/**
 * Custom hook for interacting with the Analytics contract
 * Provides functions to record events and query analytics data
 */
export const useAnalyticsContract = (network) => {
  const { doOpenAuth } = useConnect();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Record a new stream creation event
   * @param {number} streamId - Unique stream identifier
   * @param {string} sender - Stream sender address
   * @param {string} recipient - Stream recipient address
   * @param {number} totalAmount - Total amount to be streamed
   * @param {number} startBlock - Stream start block
   * @param {number} endBlock - Stream end block
   */
  const recordStreamCreation = useCallback(async (
    streamId,
    sender,
    recipient,
    totalAmount,
    startBlock,
    endBlock
  ) => {
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [
        uintCV(streamId),
        contractPrincipalCV(sender),
        contractPrincipalCV(recipient),
        uintCV(totalAmount),
        uintCV(startBlock),
        uintCV(endBlock)
      ];

      const options = {
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.RECORD_STREAM_CREATION,
        functionArgs,
        network,
        appDetails: {
          name: 'Stacks Token Streaming',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Stream creation recorded:', data);
          setLoading(false);
        },
        onCancel: () => {
          console.log('Stream creation recording cancelled');
          setLoading(false);
        },
      };

      await openContractCall(options);
    } catch (err) {
      console.error('Error recording stream creation:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [network]);

  /**
   * Record a withdrawal event
   * @param {number} streamId - Stream identifier
   * @param {number} amount - Amount withdrawn
   */
  const recordWithdrawal = useCallback(async (streamId, amount) => {
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [uintCV(streamId), uintCV(amount)];

      const options = {
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.RECORD_WITHDRAWAL,
        functionArgs,
        network,
        appDetails: {
          name: 'Stacks Token Streaming',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Withdrawal recorded:', data);
          setLoading(false);
        },
        onCancel: () => {
          console.log('Withdrawal recording cancelled');
          setLoading(false);
        },
      };

      await openContractCall(options);
    } catch (err) {
      console.error('Error recording withdrawal:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [network]);

  /**
   * Record stream completion
   * @param {number} streamId - Stream identifier
   */
  const recordStreamCompletion = useCallback(async (streamId) => {
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [uintCV(streamId)];

      const options = {
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: 'record-stream-completion',
        functionArgs,
        network,
        appDetails: {
          name: 'Stacks Token Streaming',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Stream completion recorded:', data);
          setLoading(false);
        },
        onCancel: () => {
          console.log('Stream completion recording cancelled');
          setLoading(false);
        },
      };

      await openContractCall(options);
    } catch (err) {
      console.error('Error recording stream completion:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [network]);

  /**
   * Record stream cancellation
   * @param {number} streamId - Stream identifier
   */
  const recordStreamCancellation = useCallback(async (streamId) => {
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [uintCV(streamId)];

      const options = {
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: 'record-stream-cancellation',
        functionArgs,
        network,
        appDetails: {
          name: 'Stacks Token Streaming',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('Stream cancellation recorded:', data);
          setLoading(false);
        },
        onCancel: () => {
          console.log('Stream cancellation recording cancelled');
          setLoading(false);
        },
      };

      await openContractCall(options);
    } catch (err) {
      console.error('Error recording stream cancellation:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [network]);

  /**
   * Rate a user after stream completion
   * @param {string} ratedUser - Address of user being rated
   * @param {number} streamId - Stream identifier
   * @param {number} rating - Rating (1-5 stars)
   */
  const rateUser = useCallback(async (ratedUser, streamId, rating) => {
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [
        contractPrincipalCV(ratedUser),
        uintCV(streamId),
        uintCV(rating)
      ];

      const options = {
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.RATE_USER,
        functionArgs,
        network,
        appDetails: {
          name: 'Stacks Token Streaming',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          console.log('User rated successfully:', data);
          setLoading(false);
        },
        onCancel: () => {
          console.log('Rating cancelled');
          setLoading(false);
        },
      };

      await openContractCall(options);
    } catch (err) {
      console.error('Error rating user:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [network]);

  /**
   * Get global statistics
   * @returns {Promise<Object>} Global analytics data
   */
  const getGlobalStats = useCallback(async () => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.GET_GLOBAL_STATS,
        functionArgs: [],
        network,
        senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // dummy address
      });

      return {
        totalStreams: result.value['total-streams']?.value || 0,
        totalVolume: result.value['total-volume']?.value || 0,
        completedStreams: result.value['completed-streams']?.value || 0,
        cancelledStreams: result.value['cancelled-streams']?.value || 0,
        completionRate: result.value['completion-rate']?.value || 0,
        averageStreamSize: result.value['average-stream-size']?.value || 0
      };
    } catch (err) {
      console.error('Error getting global stats:', err);
      throw err;
    }
  }, [network]);

  /**
   * Get sender statistics
   * @param {string} sender - Sender address
   * @returns {Promise<Object>} Sender analytics data
   */
  const getSenderStats = useCallback(async (sender) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.GET_SENDER_STATS,
        functionArgs: [contractPrincipalCV(sender)],
        network,
        senderAddress: sender,
      });

      return {
        totalStreamsCreated: result.value['total-streams-created']?.value || 0,
        totalAmountSent: result.value['total-amount-sent']?.value || 0,
        streamsCompleted: result.value['streams-completed']?.value || 0,
        streamsCancelled: result.value['streams-cancelled']?.value || 0,
        reputationScore: result.value['reputation-score']?.value || 50,
        totalRatingsReceived: result.value['total-ratings-received']?.value || 0,
        ratingSum: result.value['rating-sum']?.value || 0
      };
    } catch (err) {
      console.error('Error getting sender stats:', err);
      throw err;
    }
  }, [network]);

  /**
   * Get recipient statistics
   * @param {string} recipient - Recipient address
   * @returns {Promise<Object>} Recipient analytics data
   */
  const getRecipientStats = useCallback(async (recipient) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.GET_RECIPIENT_STATS,
        functionArgs: [contractPrincipalCV(recipient)],
        network,
        senderAddress: recipient,
      });

      return {
        totalStreamsReceived: result.value['total-streams-received']?.value || 0,
        totalAmountReceived: result.value['total-amount-received']?.value || 0,
        totalWithdrawn: result.value['total-withdrawn']?.value || 0,
        streamsCompleted: result.value['streams-completed']?.value || 0,
        reputationScore: result.value['reputation-score']?.value || 50,
        totalRatingsReceived: result.value['total-ratings-received']?.value || 0,
        ratingSum: result.value['rating-sum']?.value || 0
      };
    } catch (err) {
      console.error('Error getting recipient stats:', err);
      throw err;
    }
  }, [network]);

  /**
   * Get stream record
   * @param {number} streamId - Stream identifier
   * @returns {Promise<Object>} Stream record data
   */
  const getStreamRecord = useCallback(async (streamId) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: 'get-stream-record',
        functionArgs: [uintCV(streamId)],
        network,
        senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // dummy address
      });

      if (!result.value) return null;

      return {
        sender: result.value.sender?.value || '',
        recipient: result.value.recipient?.value || '',
        totalAmount: result.value['total-amount']?.value || 0,
        amountWithdrawn: result.value['amount-withdrawn']?.value || 0,
        startBlock: result.value['start-block']?.value || 0,
        endBlock: result.value['end-block']?.value || 0,
        createdAtBlock: result.value['created-at-block']?.value || 0,
        completed: result.value.completed?.value || false,
        cancelled: result.value.cancelled?.value || false
      };
    } catch (err) {
      console.error('Error getting stream record:', err);
      return null;
    }
  }, [network]);

  /**
   * Calculate sender reliability score
   * @param {string} sender - Sender address
   * @returns {Promise<number>} Reliability score (0-100)
   */
  const calculateSenderReliability = useCallback(async (sender) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: 'calculate-sender-reliability',
        functionArgs: [contractPrincipalCV(sender)],
        network,
        senderAddress: sender,
      });

      return result.value.value;
    } catch (err) {
      console.error('Error calculating sender reliability:', err);
      return 50; // Default score
    }
  }, [network]);

  /**
   * Calculate recipient engagement score
   * @param {string} recipient - Recipient address
   * @returns {Promise<number>} Engagement score (0-100)
   */
  const calculateRecipientEngagement = useCallback(async (recipient) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: 'calculate-recipient-engagement',
        functionArgs: [contractPrincipalCV(recipient)],
        network,
        senderAddress: recipient,
      });

      return result.value.value;
    } catch (err) {
      console.error('Error calculating recipient engagement:', err);
      return 50; // Default score
    }
  }, [network]);

  /**
   * Get current period ID
   * @returns {Promise<number>} Current period ID
   */
  const getCurrentPeriod = useCallback(async () => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: 'get-current-period',
        functionArgs: [],
        network,
        senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // dummy address
      });

      return result.value.value;
    } catch (err) {
      console.error('Error getting current period:', err);
      return 0;
    }
  }, [network]);

  return {
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
    clearError: () => setError(null)
  };
};