
// src/components/App.js
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';

import { watchAccountChanges, watchNetworkChanges } from '../store/interactions';
import { setContracts } from '../store/reducers/tokens';
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

  const amm1Balances = useSelector((state) => state.tokens.amm1Balances);
  const amm2Balances = useSelector((state) => state.tokens.amm2Balances);

  const loadBlockchainData = useCallback(async () => {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      setErrorMessage('MetaMask is not installed or another provider is interfering.');
      setLoading(false);
      return;
    }

    try {
      // We'll just do a "temporary" provider to get chainId here.
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);

      const network = await tempProvider.getNetwork();
      const chainId = network.chainId;
      const networkConfig = config[chainId];

      if (!networkConfig) {
        throw new Error(`No configuration found for chainId: ${chainId}`);
      }

      // Set contract addresses in Redux so we know them once user connects
      dispatch(
        setContracts({
          dappToken1Address: networkConfig.amm1.dappTokenAddress,
          usdToken1Address: networkConfig.amm1.usdTokenAddress,
          dappToken2Address: networkConfig.amm2.dappTokenAddress,
          usdToken2Address: networkConfig.amm2.usdTokenAddress,
          amm1Address: networkConfig.amm1.ammAddress,
          amm2Address: networkConfig.amm2.ammAddress,
        })
      );

      // This sets up watchers, though note that we won't see events
      // until the user actually calls `connectProvider` (which requests accounts).
      watchAccountChanges(tempProvider, dispatch);
      watchNetworkChanges(tempProvider, dispatch);

      console.log('Basic environment loaded. Waiting for user to connect wallet...');
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadBlockchainData();
  }, [loadBlockchainData]);

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
            <Route
              exact
              path="/"
              element={<Swap amm1Balances={amm1Balances} amm2Balances={amm2Balances} />}
            />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/charts" element={<Charts />} />
            <Route
              path="/tokens"
              element={
                config['31337'] && config['31337'].amm1 ? (
                  <TokenComponent tokenAddress={config['31337'].amm1.dappTokenAddress} />
                ) : (
                  <p>Token address not found</p>
                )
              }
            />
          </Routes>
        </HashRouter>
      </Container>
    </ErrorBoundary>
  );
}

export default App;