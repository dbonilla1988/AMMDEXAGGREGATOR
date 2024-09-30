import React, { useState, useEffect } from 'react';

const DexAggregator = ({ amm1Contract, amm2Contract, token1Address, token2Address }) => {
    const [priceFromAmm1, setPriceFromAmm1] = useState(null);
    const [priceFromAmm2, setPriceFromAmm2] = useState(null);
    const [bestPrice, setBestPrice] = useState(null);

    useEffect(() => {
        const fetchPrices = async () => {
            if (amm1Contract && amm2Contract && token1Address && token2Address) {
                try {
                    const price1 = await amm1Contract.getPrice(token1Address, token2Address);
                    const price2 = await amm2Contract.getPrice(token1Address, token2Address);
                    setPriceFromAmm1(price1.toString());
                    setPriceFromAmm2(price2.toString());
                    setBestPrice(Math.min(price1, price2).toString());
                } catch (error) {
                    console.error('Error fetching prices:', error);
                }
            }
        };

        fetchPrices();
    }, [amm1Contract, amm2Contract, token1Address, token2Address]);

    return (
        <div>
            <h1>Dex Aggregator</h1>
            <div>
                <h2>Price Comparison:</h2>
                <p>Price from AMM #1: {priceFromAmm1}</p>
                <p>Price from AMM #2: {priceFromAmm2}</p>
                {bestPrice !== null && (
                    <p>Best Price: {bestPrice}</p>
                )}
            </div>
        </div>
    );
};

export default DexAggregator;
