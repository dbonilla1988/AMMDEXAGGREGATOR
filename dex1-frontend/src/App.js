import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { AMM_ABI } from './contracts/AMMContract';
import { TOKEN_ABI } from './contracts/TokenContract';
import { providers } from 'ethers';
import ConnectWalletButton from './components/ConnectWalletButton';
import TokenBalance from './components/TokenBalance';
import SwapInterface from './components/SwapInterface';
import LiquidityAdd from './components/LiquidityAdd';
import LiquidityRemove from './components/LiquidityRemove';

function App() {
  const [provider, setProvider] = useState(null);
  const [ammContract, setAmmContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    async function setupProvider() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
          setProvider(provider);
          setupContracts(provider);
        } catch (error) {
          console.error("User denied account access:", error);
        }
      } else {
        console.error("Ethereum wallet not detected. Please install MetaMask.");
      }
    }

    async function setupContracts(provider) {
      if (!provider) return;
      const signer = provider.getSigner();

      const ammContractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
      const tokenContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

      const ammContractInstance = new ethers.Contract(ammContractAddress, AMM_ABI, signer);
      const tokenContractInstance = new ethers.Contract(tokenContractAddress, TOKEN_ABI, signer);

      setAmmContract(ammContractInstance);
      setTokenContract(tokenContractInstance);
    }

    setupProvider();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Edit <code>src/App.js</code> and save to reload.</p>
        <ConnectWalletButton setupProvider={setupProvider} />

        {tokenContract && <TokenBalance tokenContract={tokenContract} provider={provider} />}
        {ammContract && <SwapInterface ammContract={ammContract} userAddress={userAddress} />}
        {ammContract && <LiquidityAdd ammContract={ammContract} userAddress={userAddress} />}
        {ammContract && <LiquidityRemove ammContract={ammContract} userAddress={userAddress} />}

        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;


