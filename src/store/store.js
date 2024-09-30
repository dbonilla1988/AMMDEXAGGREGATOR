import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import providerReducer from './reducers/provider';
import tokensReducer from './reducers/tokens';
import ammReducer from './reducers/amm';
import aggregatorReducer from './reducers/aggregator'; 

export const store = configureStore({
  reducer: {
    provider: providerReducer,
    tokens: tokensReducer,
    amm: ammReducer,
    aggregator: aggregatorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,  // Disable serializability checks for non-serializable objects like provider and contract instances
    }).concat(thunk)
});