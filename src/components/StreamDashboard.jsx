import { useState, useEffect } from 'react';
import StreamForm from './StreamForm';
import StreamList from './StreamList';

const StreamDashboard = ({ streaming, wallet, isLoading }) => {
  const [streams, setStreams] = useState([]);

  // Load user streams when wallet connects
  useEffect(() => {
    if (wallet.isSignedIn) {
      // TODO: Implement stream loading from contract
      // For now, we'll show an empty list
      setStreams([]);
    }
  }, [wallet.isSignedIn]);

  const handleCreateStream = async (streamData) => {
    try {
      await streaming.createStream(streamData);
      // Refresh streams after creation
      console.log('Stream created successfully');
    } catch (error) {
      console.error('Failed to create stream:', error);
      alert('Failed to create stream. Please try again.');
    }
  };

  const handleWithdraw = async (streamId) => {
    try {
      await streaming.withdrawFromStream(streamId);
      console.log('Withdrawal successful');
    } catch (error) {
      console.error('Failed to withdraw:', error);
      alert('Failed to withdraw. Please try again.');
    }
  };

  const handleRefuel = async (streamId, amount) => {
    try {
      await streaming.refuelStream(streamId, amount);
      console.log('Stream refueled successfully');
    } catch (error) {
      console.error('Failed to refuel stream:', error);
      alert('Failed to refuel stream. Please try again.');
    }
  };

  return (
    <div className="stream-dashboard">
      <h2>Token Streams</h2>

      <StreamForm onCreateStream={handleCreateStream} />

      <div className="streams-section">
        <h3>Your Streams</h3>
        {isLoading ? (
          <p>Loading streams...</p>
        ) : (
          <StreamList
            streams={streams}
            onWithdraw={handleWithdraw}
            onRefuel={handleRefuel}
            userAddress={wallet.getStxAddress ? wallet.getStxAddress('testnet') : null}
          />
        )}
      </div>
    </div>
  );
};

export default StreamDashboard;