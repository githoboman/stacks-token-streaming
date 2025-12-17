import { useState, useEffect, useCallback } from 'react';
import { Network } from '@stacks/network';
import { useWallet } from './useWallet';
import { useStreamContract } from './useStreamContract';
import { useAnalyticsContract } from './useAnalyticsContract';

/**
 * Comprehensive hook that combines wallet, streaming, and analytics functionality
 * Provides a unified interface for the entire streaming application
 */
export const useStreamingApp = () => {
  const [network] = useState(() => new Network({ name: 'testnet' }));

  // Wallet management
  const wallet = useWallet();

  // Contract interactions
  const streamContract = useStreamContract(network);
  const analyticsContract = useAnalyticsContract(network);

  // Application state
  const [streams, setStreams] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [userStats, setUserStats] = useState(null);

  // Load user data when wallet connects
  useEffect(() => {
    if (wallet.isSignedIn && wallet.userData) {
      loadUserData(wallet.getStxAddress('testnet'));
    }
  }, [wallet.isSignedIn, wallet.userData]);

  /**
   * Load all user-related data
   * @param {string} userAddress - User's STX address
   */
  const loadUserData = useCallback(async (userAddress) => {
    if (!userAddress) return;

    try {
      // Load analytics data
      const [globalStats, senderStats, recipientStats] = await Promise.all([
        analyticsContract.getGlobalStats().catch(() => null),
        analyticsContract.getSenderStats(userAddress).catch(() => null),
        analyticsContract.getRecipientStats(userAddress).catch(() => null)
      ]);

      setAnalytics(globalStats);
      setUserStats({
        sender: senderStats,
        recipient: recipientStats
      });

      // TODO: Load user streams (would require additional contract functions)
      // For now, streams are managed locally in components

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [analyticsContract]);

  /**
   * Create a new stream with analytics recording
   * @param {Object} streamData - Stream parameters
   */
  const createStream = useCallback(async (streamData) => {
    try {
      // Create the stream
      await streamContract.createStream(streamData);

      // Record analytics (this would typically be called by the contract itself)
      // For demo purposes, we'll simulate this
      console.log('Stream creation would be recorded in analytics');

    } catch (error) {
      console.error('Error creating stream:', error);
      throw error;
    }
  }, [streamContract]);

  /**
   * Withdraw from a stream with analytics recording
   * @param {number} streamId - Stream identifier
   */
  const withdrawFromStream = useCallback(async (streamId) => {
    try {
      // Get withdrawal amount first (would need to be implemented)
      const withdrawalAmount = 1000; // Placeholder

      // Withdraw from stream
      await streamContract.withdrawFromStream(streamId);

      // Record analytics
      await analyticsContract.recordWithdrawal(streamId, withdrawalAmount);

    } catch (error) {
      console.error('Error withdrawing from stream:', error);
      throw error;
    }
  }, [streamContract, analyticsContract]);

  /**
   * Refuel a stream
   * @param {number} streamId - Stream identifier
   * @param {number} amount - Amount to add
   */
  const refuelStream = useCallback(async (streamId, amount) => {
    try {
      await streamContract.refuelStream(streamId, amount);
    } catch (error) {
      console.error('Error refueling stream:', error);
      throw error;
    }
  }, [streamContract]);

  /**
   * Rate a user after stream completion
   * @param {string} ratedUser - User being rated
   * @param {number} streamId - Stream identifier
   * @param {number} rating - Rating (1-5)
   */
  const rateUser = useCallback(async (ratedUser, streamId, rating) => {
    try {
      await analyticsContract.rateUser(ratedUser, streamId, rating);

      // Refresh user stats
      const userAddress = wallet.getStxAddress('testnet');
      if (userAddress) {
        await loadUserData(userAddress);
      }

    } catch (error) {
      console.error('Error rating user:', error);
      throw error;
    }
  }, [analyticsContract, wallet, loadUserData]);

  /**
   * Get stream balance
   * @param {number} streamId - Stream identifier
   * @param {string} address - Address to check
   * @returns {Promise<number>} Balance amount
   */
  const getStreamBalance = useCallback(async (streamId, address) => {
    try {
      const balance = await streamContract.getStreamBalance(streamId, address);
      return balance.value;
    } catch (error) {
      console.error('Error getting stream balance:', error);
      return 0;
    }
  }, [streamContract]);

  /**
   * Get current block height
   * @returns {Promise<number>} Current block height
   */
  const getCurrentBlockHeight = useCallback(async () => {
    try {
      return await streamContract.getCurrentBlockHeight();
    } catch (error) {
      console.error('Error getting block height:', error);
      return 0;
    }
  }, [streamContract]);

  /**
   * Refresh all analytics data
   */
  const refreshAnalytics = useCallback(async () => {
    const userAddress = wallet.getStxAddress('testnet');
    if (userAddress) {
      await loadUserData(userAddress);
    }
  }, [wallet, loadUserData]);

  /**
   * Calculate sender reliability score
   * @param {string} sender - Sender address
   * @returns {Promise<number>} Reliability score
   */
  const getSenderReliability = useCallback(async (sender) => {
    try {
      return await analyticsContract.calculateSenderReliability(sender);
    } catch (error) {
      console.error('Error calculating sender reliability:', error);
      return 50;
    }
  }, [analyticsContract]);

  /**
   * Calculate recipient engagement score
   * @param {string} recipient - Recipient address
   * @returns {Promise<number>} Engagement score
   */
  const getRecipientEngagement = useCallback(async (recipient) => {
    try {
      return await analyticsContract.calculateRecipientEngagement(recipient);
    } catch (error) {
      console.error('Error calculating recipient engagement:', error);
      return 50;
    }
  }, [analyticsContract]);

  // Combined loading and error states
  const isLoading = wallet.loading || streamContract.loading || analyticsContract.loading;
  const error = wallet.error || streamContract.error || analyticsContract.error;

  return {
    // Wallet state and functions
    wallet: {
      ...wallet,
      connectWallet: wallet.connectWallet,
      disconnectWallet: wallet.disconnectWallet,
      getWalletInfo: wallet.getWalletInfo
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
      data: analytics,
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
      clearError: () => {
        wallet.clearError();
        streamContract.clearError();
        analyticsContract.clearError();
      }
    }
  };
};