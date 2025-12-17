import { useConnect } from '@stacks/connect-react';

const WalletConnect = ({ wallet }) => {
  const { doOpenAuth } = useConnect();

  const handleConnect = () => {
    wallet.connectWallet();
  };

  const handleSignOut = () => {
    wallet.disconnectWallet();
  };

  const walletInfo = wallet.getWalletInfo();

  if (walletInfo.isConnected) {
    return (
      <div className="wallet-info">
        <span className="wallet-address">
          Connected: {walletInfo.shortAddress}
        </span>
        <button onClick={handleSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect} className="connect-btn" disabled={wallet.loading}>
      {wallet.loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default WalletConnect;