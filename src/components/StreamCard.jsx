import { useState } from 'react';

const StreamCard = ({ stream, onWithdraw, onRefuel, userAddress }) => {
  const [refuelAmount, setRefuelAmount] = useState('');

  const isSender = userAddress === stream.sender;
  const isRecipient = userAddress === stream.recipient;

  const handleWithdraw = () => {
    onWithdraw(stream.id);
  };

  const handleRefuel = (e) => {
    e.preventDefault();
    if (refuelAmount && parseInt(refuelAmount) > 0) {
      onRefuel(stream.id, parseInt(refuelAmount));
      setRefuelAmount('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="stream-card">
      <div className="stream-header">
        <h4>Stream #{stream.id}</h4>
        <span className={`status ${getStatusColor(stream.status)}`}>
          {stream.status}
        </span>
      </div>

      <div className="stream-details">
        <div className="detail-row">
          <span>Sender:</span>
          <span className="address">{stream.sender}</span>
        </div>
        <div className="detail-row">
          <span>Recipient:</span>
          <span className="address">{stream.recipient}</span>
        </div>
        <div className="detail-row">
          <span>Total Amount:</span>
          <span>{stream.totalAmount} STX</span>
        </div>
        <div className="detail-row">
          <span>Withdrawn:</span>
          <span>{stream.withdrawnAmount} STX</span>
        </div>
        <div className="detail-row">
          <span>Payment per Block:</span>
          <span>{stream.paymentPerBlock} STX</span>
        </div>
        <div className="detail-row">
          <span>Blocks:</span>
          <span>{stream.startBlock} - {stream.endBlock}</span>
        </div>
      </div>

      <div className="stream-actions">
        {isRecipient && stream.status === 'active' && (
          <button onClick={handleWithdraw} className="withdraw-btn">
            Withdraw Available
          </button>
        )}

        {isSender && stream.status === 'active' && (
          <form onSubmit={handleRefuel} className="refuel-form">
            <input
              type="number"
              value={refuelAmount}
              onChange={(e) => setRefuelAmount(e.target.value)}
              placeholder="Amount to add"
              min="1"
            />
            <button type="submit" className="refuel-btn">
              Refuel Stream
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StreamCard;