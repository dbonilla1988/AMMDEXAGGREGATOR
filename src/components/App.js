import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import {
  loadAccount,
  loadBalances,
  loadTokens,
  loadNetwork,
  loadAggregator,
  loadProvider,
  watchAccountChanges,
  watchNetworkChanges
} from '../store/interactions';
import { setContracts, balancesLoaded } from '../store/reducers/tokens';
import config from '../config.json';
import Navigation from './Navigation';
import Tabs from './Tabs';
import Swap from './Swap';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Charts from './Charts';
import TokenComponent from './TokenComponents';
import ErrorBoundary from './ErrorBoundary';

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Select balances from Redux state
  const amm1Balances = useSelector((state) => state.tokens.amm1Balances);
  const amm2Balances = useSelector((state) => state.tokens.amm2Balances);

  const loadBlockchainData = async () => {
    if (typeof window.ethereum === 'undefined') {
      setErrorMessage('MetaMask is not installed. Please install it to use this DApp.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Load the Ethereum provider (MetaMask)
      const provider = await loadProvider(dispatch);
      if (!provider) throw new Error('Failed to load Ethereum provider.');

      // Step 2: Load the network (e.g., Hardhat, Mainnet, Testnet)
      const chainId = await loadNetwork(provider, dispatch);
      if (!chainId) throw new Error('Failed to load network.');

      // Step 3: Fetch network configuration based on the chainId
      const networkConfig = config[chainId];
      if (!networkConfig) throw new Error(`No configuration found for chainId: ${chainId}`);

      // Step 4: Dispatch contract details to Redux
      dispatch(setContracts({
        dappToken1Address: networkConfig.amm1.dappTokenAddress,
        usdToken1Address: networkConfig.amm1.usdTokenAddress,
        dappToken2Address: networkConfig.amm2.dappTokenAddress,
        usdToken2Address: networkConfig.amm2.usdTokenAddress,
      }));

      // Step 5: Load the user account (MetaMask)
      const account = await loadAccount(dispatch);
      if (!account) throw new Error('No MetaMask account found.');

      // Step 6: Load tokens, aggregator, and balances
      await loadTokens(provider, chainId, dispatch);
      await loadAggregator(provider, chainId, dispatch);

      const balances = await loadBalances(provider, dispatch);
      dispatch(balancesLoaded(balances));

      // Step 7: Watch for account and network changes
      watchAccountChanges(provider, dispatch);
      watchNetworkChanges(provider, dispatch);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, [dispatch]);

  if (loading) {
    return <p>Loading blockchain data...</p>;
  }

  if (errorMessage) {
    return <p>Error: {errorMessage}</p>;
  }

  return (
    <ErrorBoundary>
      <Container>
        <HashRouter>
          <Navigation />
          <hr />
          <Tabs />
          <Routes>
            <Route exact path="/" element={<Swap amm1Balances={amm1Balances} amm2Balances={amm2Balances} />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/tokens" element={<TokenComponent tokenAddress="0x5FbDB2315678afecb367f032d93F642f64180aa3" />} />
          </Routes>
        </HashRouter>
      </Container>
    </ErrorBoundary>
  );
}

export default App;