// src/components/TokenComponent.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTokenData } from '../store/actions'; // Import fetchTokenData from actions or wherever it is defined

const TokenComponent = ({ tokenAddress }) => {
  const dispatch = useDispatch();
  const tokenData = useSelector(state => state.tokens.balances);
  const loading = useSelector(state => state.tokens.loading);
  const error = useSelector(state => state.tokens.error);

  useEffect(() => {
    dispatch(fetchTokenData(tokenAddress));
  }, [dispatch, tokenAddress]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Token Information</h1>
      <pre>{JSON.stringify(tokenData, null, 2)}</pre>
    </div>
  );
};

export default TokenComponent;
