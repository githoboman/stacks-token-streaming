import { useState, useEffect } from 'react';

const AnalyticsDashboard = ({ analytics, wallet, isLoading }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await analytics.refreshAnalytics();
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    }
    setRefreshing(false);
  };

  const handleRateUser = async (ratedUser, streamId, rating) => {
    try {
      await analytics.rateUser(ratedUser, streamId, rating);
      console.log('User rated successfully');
    } catch (error) {
      console.error('Failed to rate user:', error);
      alert('Failed to rate user. Please try again.');
    }
  };

  if (isLoading && !analytics.data) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Network Analytics</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="refresh-btn"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {analytics.data && (
        <div className="global-stats">
          <h3>Global Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Streams</h4>
              <p className="stat-value">{analytics.data.totalStreams}</p>
            </div>
            <div className="stat-card">
              <h4>Total Volume</h4>
              <p className="stat-value">{analytics.data.totalVolume} STX</p>
            </div>
            <div className="stat-card">
              <h4>Completed Streams</h4>
              <p className="stat-value">{analytics.data.completedStreams}</p>
            </div>
            <div className="stat-card">
              <h4>Completion Rate</h4>
              <p className="stat-value">{analytics.data.completionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {analytics.userStats && (
        <div className="user-stats">
          <h3>Your Statistics</h3>

          <div className="stats-section">
            <h4>As Sender</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <h5>Streams Created</h5>
                <p>{analytics.userStats.sender?.totalStreamsCreated || 0}</p>
              </div>
              <div className="stat-card">
                <h5>Total Sent</h5>
                <p>{analytics.userStats.sender?.totalAmountSent || 0} STX</p>
              </div>
              <div className="stat-card">
                <h5>Completed</h5>
                <p>{analytics.userStats.sender?.streamsCompleted || 0}</p>
              </div>
              <div className="stat-card">
                <h5>Reputation</h5>
                <p>{analytics.userStats.sender?.reputationScore || 50}/100</p>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h4>As Recipient</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <h5>Streams Received</h5>
                <p>{analytics.userStats.recipient?.totalStreamsReceived || 0}</p>
              </div>
              <div className="stat-card">
                <h5>Total Received</h5>
                <p>{analytics.userStats.recipient?.totalAmountReceived || 0} STX</p>
              </div>
              <div className="stat-card">
                <h5>Withdrawn</h5>
                <p>{analytics.userStats.recipient?.totalWithdrawn || 0} STX</p>
              </div>
              <div className="stat-card">
                <h5>Reputation</h5>
                <p>{analytics.userStats.recipient?.reputationScore || 50}/100</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating functionality would go here */}
      <div className="rating-section">
        <h3>Rate Stream Partners</h3>
        <p>Rating functionality available after stream completion.</p>
        {/* TODO: Implement rating UI */}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;