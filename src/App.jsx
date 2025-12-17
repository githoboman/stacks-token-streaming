import { useState, useEffect } from 'react';
import { Connect } from '@stacks/connect-react';
import { AppConfig, UserSession } from '@stacks/connect';
import WalletConnect from './components/WalletConnect';
import StreamDashboard from './components/StreamDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { BackgroundRippleEffect } from './components/ui/background-ripple-effect';
import { useStreamingApp } from './hooks/useStreamingApp';
import './App.css';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

function App() {
  const [activeTab, setActiveTab] = useState('streams');

  // Use the comprehensive streaming app hook
  const { wallet, streaming, analytics, state } = useStreamingApp();

  const authOptions = {
    redirectTo: '/',
    manifestPath: '/manifest.json',
    onFinish: (payload) => {
      // Wallet hook handles this automatically
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
            wallet={wallet}
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
          {wallet.isSignedIn ? (
            <>
              {activeTab === 'streams' && (
                <StreamDashboard
                  streaming={streaming}
                  wallet={wallet}
                  isLoading={state.isLoading}
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsDashboard
                  analytics={analytics}
                  wallet={wallet}
                  isLoading={state.isLoading}
                />
              )}
            </>
          ) : (
            <div className="connect-prompt">
              <h2>Welcome to Stacks Token Streaming</h2>
              <p>Please connect your wallet to start streaming tokens and view analytics.</p>
              {state.error && (
                <div className="error-message">
                  <p>Error: {state.error}</p>
                  <button onClick={state.utils?.clearError}>Dismiss</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </Connect>
  );
}

export default App;