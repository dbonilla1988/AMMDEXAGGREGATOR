// src/components/SwapInterface.js
import React, { useState } from 'react';
import { utils } from 'ethers';


function SwapInterface({ ammContract }) {
  const [amount, setAmount] = useState('');
  // Assuming two tokens: token1ToToken2 or token2ToToken1 for the swap direction.
  const [swapDirection, setSwapDirection] = useState('token1ToToken2');

  const handleSwap = async () => {
    if (!ammContract || !amount) return;

    try {
      // Adjust the '18' based on your token's decimals.
      const formattedAmount = ethers.utils.parseUnits(amount, 18); 
      let tx;
      
      // Check the direction of the swap and call the appropriate contract method.
      if (swapDirection === 'token1ToToken2') {
        tx = await ammContract.swapToken1ForToken2(formattedAmount);
      } else {
        tx = await ammContract.swapToken2ForToken1(formattedAmount);
      }

      await tx.wait();
      console.log(`Swap successful with transaction hash: ${tx.hash}`);
      // Reset the amount after the swap is completed.
      setAmount('');
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  return (
    <div>
      <h3>Swap Tokens</h3>
      <select value={swapDirection} onChange={(e) => setSwapDirection(e.target.value)}>
        <option value="token1ToToken2">Token 1 to Token 2</option>
        <option value="token2ToToken1">Token 2 to Token 1</option>
      </select>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
      />
      <button onClick={handleSwap}>Swap</button>
    </div>
  );
}

export default SwapInterface;
