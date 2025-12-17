import { useState, useEffect } from 'react';
import { callReadOnlyFunction, contractPrincipalCV } from '@stacks/transactions';
import { ANALYTICS_CONTRACT_ADDRESS, ANALYTICS_CONTRACT_NAME, CONTRACT_FUNCTIONS } from '../utils/constants';

const AnalyticsDashboard = ({ userSession, network }) => {
  const [globalStats, setGlobalStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    if (userSession && userSession.isUserSignedIn()) {
      const address = userSession.loadUserData().profile.stxAddress.testnet;
      setUserAddress(address);
      loadAnalytics(address);
    }
  }, [userSession]);

  const loadAnalytics = async (address) => {
    setLoading(true);
    try {
      // Load global statistics
      const globalStatsResult = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.GET_GLOBAL_STATS,
        functionArgs: [],
        network,
        senderAddress: address,
      });

      setGlobalStats(globalStatsResult.value);

      // Load user statistics
      const senderStatsResult = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.GET_SENDER_STATS,
        functionArgs: [contractPrincipalCV(address)],
        network,
        senderAddress: address,
      });

      const recipientStatsResult = await callReadOnlyFunction({
        contractAddress: ANALYTICS_CONTRACT_ADDRESS,
        contractName: ANALYTICS_CONTRACT_NAME,
        functionName: CONTRACT_FUNCTIONS.GET_RECIPIENT_STATS,
        functionArgs: [contractPrincipalCV(address)],
        network,
        senderAddress: address,
      });

      setUserStats({
        sender: senderStatsResult.value,
        recipient: recipientStatsResult.value
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h2>Network Analytics</h2>

      {globalStats && (
        <div className="global-stats">
          <h3>Global Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Streams</h4>
              <p className="stat-value">{globalStats['total-streams']?.value || 0}</p>
            </div>
            <div className="stat-card">
              <h4>Total Volume</h4>
              <p className="stat-value">{globalStats['total-volume']?.value || 0} STX</p>
            </div>
            <div className="stat-card">
              <h4>Completed Streams</h4>
              <p className="stat-value">{globalStats['completed-streams']?.value || 0}</p>
            </div>
            <div className="stat-card">
              <h4>Completion Rate</h4>
              <p className="stat-value">{globalStats['completion-rate']?.value || 0}%</p>
            </div>
          </div>
        </div>
      )}

      {userStats && (
        <div className="user-stats">
          <h3>Your Statistics</h3>

          <div className="stats-section">
            <h4>As Sender</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <h5>Streams Created</h5>
                <p>{userStats.sender['total-streams-created']?.value || 0}</p>
              </div>
              <div className="stat-card">
                <h5>Total Sent</h5>
                <p>{userStats.sender['total-amount-sent']?.value || 0} STX</p>
              </div>
              <div className="stat-card">
                <h5>Completed</h5>
                <p>{userStats.sender['streams-completed']?.value || 0}</p>
              </div>
              <div className="stat-card">
                <h5>Reputation</h5>
                <p>{userStats.sender['reputation-score']?.value || 50}/100</p>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h4>As Recipient</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <h5>Streams Received</h5>
                <p>{userStats.recipient['total-streams-received']?.value || 0}</p>
              </div>
              <div className="stat-card">
                <h5>Total Received</h5>
                <p>{userStats.recipient['total-amount-received']?.value || 0} STX</p>
              </div>
              <div className="stat-card">
                <h5>Withdrawn</h5>
                <p>{userStats.recipient['total-withdrawn']?.value || 0} STX</p>
              </div>
              <div className="stat-card">
                <h5>Reputation</h5>
                <p>{userStats.recipient['reputation-score']?.value || 50}/100</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;