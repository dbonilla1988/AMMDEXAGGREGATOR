import React, { useState } from 'react';

const ConnectWalletButton = () => {
    const [account, setAccount] = useState('');

    async function connectWallet() {
        if (window.ethereum) { // Check if MetaMask is installed
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request account access
                console.log('Connected account:', accounts[0]);
                setAccount(accounts[0]); // Update state with the connected account
            } catch (error) {
                console.error('User denied account access');
            }
        } else {
            console.log('MetaMask is not installed');
            // Optionally, prompt the user to install MetaMask.
        }
    }

    return (
        <div>
            <button onClick={connectWallet}>Connect Wallet</button>
            {account && <p>Connected Account: {account}</p>}
        </div>
    );
};

export default ConnectWalletButton;
