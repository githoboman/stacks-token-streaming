import { useState, useEffect } from 'react';
import { Connect } from '@stacks/connect-react';
import { AppConfig, UserSession } from '@stacks/connect';
import { Network } from '@stacks/network';
import WalletConnect from './components/WalletConnect';
import StreamDashboard from './components/StreamDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { BackgroundRippleEffect } from './components/ui/background-ripple-effect';
import './App.css';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [userData, setUserData] = useState(null);
  const [network, setNetwork] = useState(new Network({ name: 'testnet' }));
  const [activeTab, setActiveTab] = useState('streams');

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  const handleSignOut = () => {
    userSession.signUserOut();
    setUserData(null);
  };

  const authOptions = {
    redirectTo: '/',
    manifestPath: '/manifest.json',
    onFinish: (payload) => {
      setUserData(payload);
    },
    userSession,
  };

  return (
    <Connect authOptions={authOptions}>
      <div className="App relative">
        <BackgroundRippleEffect />
        <header className="App-header relative z-10">
          <h1>Stacks Token Streaming</h1>
          <WalletConnect
            userSession={userSession}
            userData={userData}
            onSignOut={handleSignOut}
          />
        </header>

        <nav className="App-nav relative z-10">
          <button
            className={activeTab === 'streams' ? 'active' : ''}
            onClick={() => setActiveTab('streams')}
          >
            Streams
          </button>
          <button
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>

        <main className="App-main relative z-10">
          {userData ? (
            <>
              {activeTab === 'streams' && (
                <StreamDashboard userSession={userSession} network={network} />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsDashboard userSession={userSession} network={network} />
              )}
            </>
          ) : (
            <div className="connect-prompt">
              <h2>Welcome to Stacks Token Streaming</h2>
              <p>Please connect your wallet to start streaming tokens and view analytics.</p>
            </div>
          )}
        </main>
      </div>
    </Connect>
  );
}

export default App;