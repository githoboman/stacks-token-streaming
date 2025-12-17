import { useState } from 'react';

const StreamForm = ({ onCreateStream }) => {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    startBlock: '',
    endBlock: '',
    paymentPerBlock: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert string values to appropriate types
    const streamData = {
      recipient: formData.recipient,
      amount: parseInt(formData.amount),
      startBlock: parseInt(formData.startBlock),
      endBlock: parseInt(formData.endBlock),
      paymentPerBlock: parseInt(formData.paymentPerBlock)
    };

    onCreateStream(
      streamData.recipient,
      streamData.amount,
      streamData.startBlock,
      streamData.endBlock,
      streamData.paymentPerBlock
    );

    // Reset form
    setFormData({
      recipient: '',
      amount: '',
      startBlock: '',
      endBlock: '',
      paymentPerBlock: ''
    });
  };

  return (
    <div className="stream-form">
      <h3>Create New Stream</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address:</label>
          <input
            type="text"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="ST..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Total Amount (STX):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="1000000"
            min="1"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startBlock">Start Block:</label>
            <input
              type="number"
              id="startBlock"
              name="startBlock"
              value={formData.startBlock}
              onChange={handleChange}
              placeholder="Current block + 10"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endBlock">End Block:</label>
            <input
              type="number"
              id="endBlock"
              name="endBlock"
              value={formData.endBlock}
              onChange={handleChange}
              placeholder="Start block + duration"
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="paymentPerBlock">Payment per Block:</label>
          <input
            type="number"
            id="paymentPerBlock"
            name="paymentPerBlock"
            value={formData.paymentPerBlock}
            onChange={handleChange}
            placeholder="1000"
            min="1"
            required
          />
        </div>

        <button type="submit" className="create-stream-btn">
          Create Stream
        </button>
      </form>
    </div>
  );
};

export default StreamForm;