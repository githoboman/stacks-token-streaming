import StreamCard from './StreamCard';

const StreamList = ({ streams, onWithdraw, onRefuel, userAddress }) => {
  if (streams.length === 0) {
    return (
      <div className="no-streams">
        <p>You don't have any active streams yet.</p>
        <p>Create your first stream above to get started!</p>
      </div>
    );
  }

  return (
    <div className="stream-list">
      {streams.map((stream) => (
        <StreamCard
          key={stream.id}
          stream={stream}
          onWithdraw={onWithdraw}
          onRefuel={onRefuel}
          userAddress={userAddress}
        />
      ))}
    </div>
  );
};

export default StreamList;