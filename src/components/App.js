// src/components/App.js
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ethers } from "ethers";

import { watchAccountChanges, watchNetworkChanges } from "../store/interactions";
import { setContracts } from "../store/reducers/tokens";
import config from "../config.json";

import Navigation from "./Navigation";
import Tabs from "./Tabs";
import Swap from "./Swap";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import Charts from "./Charts";
import TokenComponent from "./TokenComponents";
import ErrorBoundary from "./ErrorBoundary";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const amm1Balances = useSelector((state) => state.tokens.amm1Balances);
  const amm2Balances = useSelector((state) => state.tokens.amm2Balances);

  /**
   * Called once on mount, tries to set up blockchain environment.
   */
  const loadBlockchainData = useCallback(async () => {
    // 1) Check if a wallet is present
    if (!window.ethereum) {
      setErrorMessage(
        "MetaMask is not installed or another provider is interfering. Please install a Web3 wallet."
      );
      setLoading(false);
      return;
    }

    try {
      // 2) Create a temporary provider & get chain info
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await tempProvider.getNetwork();
      const chainId = network.chainId;

      // 3) Find matching config for chainId
      const networkConfig = config[chainId];
      if (!networkConfig) {
        throw new Error(`No configuration found for chainId: ${chainId}`);
      }

      // 4) Dispatch addresses to Redux
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

      // 5) Watch for wallet changes
      watchAccountChanges(tempProvider, dispatch);
      watchNetworkChanges(tempProvider, dispatch);

      console.log("Environment loaded. Waiting for user to connect wallet...");
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // On mount, call loadBlockchainData
  useEffect(() => {
    loadBlockchainData();
  }, [loadBlockchainData]);

  // Show "loading..." until we have a result
  if (loading) {
    return <p>Loading blockchain data...</p>;
  }

  /*
   If there is an error (like no wallet), show a friendlier UI 
  */
  if (errorMessage) {
    return (
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <h2>Error</h2>
        <p>{errorMessage}</p>
        <p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007bff", textDecoration: "underline" }}
          >
            Install MetaMask
          </a>{" "}
          or another Web3 wallet to continue.
        </p>
      </div>
    );
  }

  // Otherwise, show the main app
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
                config["31337"] && config["31337"].amm1 ? (
                  <TokenComponent tokenAddress={config["31337"].amm1.dappTokenAddress} />
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