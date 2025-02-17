import React from 'react';
import { useSelector } from 'react-redux';

const LiquidityBalance = () => {
    const amm1Balances = useSelector(state => state.balances.amm1);
    const amm2Balances = useSelector(state => state.balances.amm2);

    return (
        <div>
            <h1>Liquidity Balance</h1>
            <p>AMM1 Dapp Token Balance: {amm1Balances.dappTokenBalance}</p>
            <p>AMM1 USD Token Balance: {amm1Balances.usdTokenBalance}</p>
            <p>AMM2 Dapp Token Balance: {amm2Balances.dappTokenBalance}</p>
            <p>AMM2 USD Token Balance: {amm2Balances.usdTokenBalance}</p>
        </div>
    );
};

export default LiquidityBalance;

