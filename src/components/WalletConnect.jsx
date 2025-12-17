import { useConnect } from '@stacks/connect-react';

const WalletConnect = ({ userSession, userData, onSignOut }) => {
  const { doOpenAuth } = useConnect();

  const handleConnect = () => {
    doOpenAuth();
  };

  if (userData) {
    return (
      <div className="wallet-info">
        <span className="wallet-address">
          Connected: {userData.profile.stxAddress.testnet.slice(0, 6)}...
          {userData.profile.stxAddress.testnet.slice(-4)}
        </span>
        <button onClick={onSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect} className="connect-btn">
      Connect Wallet
    </button>
  );
};

export default WalletConnect;