import React from 'react';

const LiquidityBalance = ({ amm1Balances, amm2Balances }) => {
    return (
        <div>
            <h1>Liquidity Balance</h1>
            <p>AMM1 Dapp Token Balance: {amm1Balances && amm1Balances.dappTokenBalance}</p>
            <p>AMM1 USD Token Balance: {amm1Balances && amm1Balances.usdTokenBalance}</p>
            <p>AMM2 Dapp Token Balance: {amm2Balances && amm2Balances.dappTokenBalance}</p>
            <p>AMM2 USD Token Balance: {amm2Balances && amm2Balances.usdTokenBalance}</p>
        </div>
    );
};

export default LiquidityBalance;
