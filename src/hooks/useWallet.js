import { useState, useEffect, useCallback } from 'react';
import { UserSession } from '@stacks/connect';
import { useConnect } from '@stacks/connect-react';

/**
 * Custom hook for managing Hiro wallet connection and user session
 * Provides authentication state, user data, and wallet operations
 */
export const useWallet = () => {
  const { doOpenAuth } = useConnect();
  const [userSession] = useState(() => new UserSession());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user session on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (userSession.isSignInPending()) {
          const pendingUserData = await userSession.handlePendingSignIn();
          setUserData(pendingUserData);
        } else if (userSession.isUserSignedIn()) {
          const currentUserData = userSession.loadUserData();
          setUserData(currentUserData);
        }
      } catch (err) {
        console.error('Error initializing user session:', err);
        setError('Failed to initialize wallet session');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [userSession]);

  /**
   * Connect wallet using Hiro authentication
   */
  const connectWallet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await doOpenAuth();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
      setLoading(false);
    }
  }, [doOpenAuth]);

  /**
   * Disconnect wallet and clear session
   */
  const disconnectWallet = useCallback(() => {
    try {
      userSession.signUserOut();
      setUserData(null);
      setError(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet');
    }
  }, [userSession]);

  /**
   * Get user's STX address for current network
   * @param {string} network - 'mainnet' or 'testnet'
   * @returns {string|null} STX address or null if not connected
   */
  const getStxAddress = useCallback((network = 'testnet') => {
    if (!userData) return null;

    try {
      return userData.profile.stxAddress[network];
    } catch (err) {
      console.error('Error getting STX address:', err);
      return null;
    }
  }, [userData]);

  /**
   * Check if user is signed in
   * @returns {boolean} True if user is authenticated
   */
  const isSignedIn = useCallback(() => {
    return userSession.isUserSignedIn();
  }, [userSession]);

  /**
   * Check if sign in is pending
   * @returns {boolean} True if authentication is in progress
   */
  const isSignInPending = useCallback(() => {
    return userSession.isSignInPending();
  }, [userSession]);

  /**
   * Get user profile information
   * @returns {Object|null} User profile data or null
   */
  const getUserProfile = useCallback(() => {
    if (!userData) return null;

    try {
      return {
        username: userData.username,
        profile: userData.profile,
        decentralizedID: userData.decentralizedID,
        identityAddress: userData.identityAddress,
        stxAddress: {
          mainnet: userData.profile.stxAddress.mainnet,
          testnet: userData.profile.stxAddress.testnet
        },
        btcAddress: {
          mainnet: userData.profile.btcAddress.mainnet,
          testnet: userData.profile.btcAddress.testnet
        }
      };
    } catch (err) {
      console.error('Error getting user profile:', err);
      return null;
    }
  }, [userData]);

  /**
   * Get formatted wallet info for display
   * @returns {Object} Wallet display information
   */
  const getWalletInfo = useCallback(() => {
    const isConnected = isSignedIn();
    const stxAddress = getStxAddress('testnet');

    return {
      isConnected,
      stxAddress,
      shortAddress: stxAddress
        ? `${stxAddress.slice(0, 6)}...${stxAddress.slice(-4)}`
        : null,
      profile: getUserProfile()
    };
  }, [isSignedIn, getStxAddress, getUserProfile]);

  /**
   * Clear any authentication errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    userData,
    loading,
    error,

    // Authentication
    connectWallet,
    disconnectWallet,
    isSignedIn: isSignedIn(),
    isSignInPending: isSignInPending(),

    // User Data
    getStxAddress,
    getUserProfile,
    getWalletInfo,

    // Utilities
    clearError,

    // Raw session (for advanced usage)
    userSession
  };
};