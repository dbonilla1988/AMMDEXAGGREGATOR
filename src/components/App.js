import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { useDispatch } from 'react-redux';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
// Assuming ethers import is used somewhere not shown in this snippet

// Components
import Navigation from './Navigation';
import Tabs from './Tabs';
import Swap from './Swap';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Charts from './Charts';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadAMM,
} from '../store/interactions';

function App() {
  const dispatch = useDispatch();

  // Define loadBlockchainData with useCallback to memoize the function
  const loadBlockchainData = useCallback(async () => {
    const provider = await loadProvider(dispatch);
    const chainId = await loadNetwork(provider, dispatch);

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });

    window.ethereum.on('accountsChanged', async () => {
      await loadAccount(dispatch);
    });

    await loadTokens(provider, chainId, dispatch);
    await loadAMM(provider, chainId, dispatch);
  }, [dispatch]); // Dependencies array for useCallback

  useEffect(() => {
    loadBlockchainData();
  }, [loadBlockchainData]); // Include loadBlockchainData in the dependency array

  return (
    <Container>
      <HashRouter>
        <Navigation />
        <hr />
        <Tabs />
        <Routes>
          <Route exact path="/" element={<Swap />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/charts" element={<Charts />} />
        </Routes>
      </HashRouter>
    </Container>
  );
}

export default App;

