import balanceReducer from './balanceReducer'; // or similar

export const store = configureStore({
  reducer: {
    provider: providerReducer,
    tokens: tokensReducer,
    balances: balanceReducer, // <== You can remove or comment this
    aggregator: aggregatorReducer
  },
  // ...
});