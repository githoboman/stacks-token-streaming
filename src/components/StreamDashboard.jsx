import { useState, useEffect } from 'react';
import { callReadOnlyFunction, contractPrincipalCV, uintCV, tupleCV } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import StreamForm from './StreamForm';
import StreamList from './StreamList';
import { STREAM_CONTRACT_ADDRESS, STREAM_CONTRACT_NAME } from '../utils/constants';

const StreamDashboard = ({ userSession, network }) => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    if (userSession && userSession.isUserSignedIn()) {
      const address = userSession.loadUserData().profile.stxAddress.testnet;
      setUserAddress(address);
      loadUserStreams(address);
    }
  }, [userSession]);

  const loadUserStreams = async (address) => {
    setLoading(true);
    try {
      // This would require implementing stream tracking
      // For now, we'll show a placeholder
      setStreams([]);
    } catch (error) {
      console.error('Error loading streams:', error);
    }
    setLoading(false);
  };

  const createStream = async (recipient, amount, startBlock, endBlock, paymentPerBlock) => {
    const functionArgs = [
      contractPrincipalCV(recipient),
      uintCV(amount),
      tupleCV({
        'start-block': uintCV(startBlock),
        'stop-block': uintCV(endBlock)
      }),
      uintCV(paymentPerBlock)
    ];

    const options = {
      contractAddress: STREAM_CONTRACT_ADDRESS,
      contractName: STREAM_CONTRACT_NAME,
      functionName: 'stream-to',
      functionArgs,
      network,
      appDetails: {
        name: 'Stacks Token Streaming',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: (data) => {
        console.log('Stream created:', data);
        loadUserStreams(userAddress);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(options);
  };

  const withdrawFromStream = async (streamId) => {
    const functionArgs = [uintCV(streamId)];

    const options = {
      contractAddress: STREAM_CONTRACT_ADDRESS,
      contractName: STREAM_CONTRACT_NAME,
      functionName: 'withdraw',
      functionArgs,
      network,
      appDetails: {
        name: 'Stacks Token Streaming',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: (data) => {
        console.log('Withdrawal completed:', data);
        loadUserStreams(userAddress);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(options);
  };

  const refuelStream = async (streamId, amount) => {
    const functionArgs = [uintCV(streamId), uintCV(amount)];

    const options = {
      contractAddress: STREAM_CONTRACT_ADDRESS,
      contractName: STREAM_CONTRACT_NAME,
      functionName: 'refuel',
      functionArgs,
      network,
      appDetails: {
        name: 'Stacks Token Streaming',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: (data) => {
        console.log('Stream refueled:', data);
        loadUserStreams(userAddress);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(options);
  };

  return (
    <div className="stream-dashboard">
      <h2>Token Streams</h2>

      <StreamForm onCreateStream={createStream} />

      <div className="streams-section">
        <h3>Your Streams</h3>
        {loading ? (
          <p>Loading streams...</p>
        ) : (
          <StreamList
            streams={streams}
            onWithdraw={withdrawFromStream}
            onRefuel={refuelStream}
            userAddress={userAddress}
          />
        )}
      </div>
    </div>
  );
};

export default StreamDashboard;