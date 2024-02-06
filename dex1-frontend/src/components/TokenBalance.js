// src/components/TokenBalance.js
import React, { useState, useEffect } from 'react';

const TokenBalance = ({ provider, tokenContract }) => {
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!provider || !tokenContract) return;

      try {
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const balance = await tokenContract.balanceOf(address);
        setBalance(balance.toString());
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [provider, tokenContract]);

  return (
    <div>
      <h3>Token Balance</h3>
      <p>{balance}</p>
    </div>
  );
};

export default TokenBalance;
