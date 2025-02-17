import { createSlice } from '@reduxjs/toolkit';

export const tokens = createSlice({
  name: 'tokens',
  initialState: {
    contracts: {
      dappToken1Address: null,
      usdToken1Address: null,
      dappToken2Address: null,
      usdToken2Address: null,
      AMM_ABI: null,
      Token_ABI: null,
    },
    symbols: {
      dappToken1Symbol: null,
      usdToken1Symbol: null,
      dappToken2Symbol: null,
      usdToken2Symbol: null,
    },
    amm1Balances: {
      dappTokenBalance: '0',
      usdTokenBalance: '0',
    },
    amm2Balances: {
      dappTokenBalance: '0',
      usdTokenBalance: '0',
    },
    loading: false,
    error: null,
  },
  reducers: {
    setContracts: (state, action) => {
      state.contracts = action.payload;
    },
    setSymbols: (state, action) => {
      const [dappToken1Symbol, usdToken1Symbol, dappToken2Symbol, usdToken2Symbol] = action.payload;
      state.symbols = {
        dappToken1Symbol,
        usdToken1Symbol,
        dappToken2Symbol,
        usdToken2Symbol,
      };
    },
    tokenBalancesLoaded: (state, action) => {
      const { amm1, amm2 } = action.payload || {};

      // Log the payload for debugging
      console.log('Reducer: Payload received in tokenBalancesLoaded:', action.payload);

      // Validate payload and update state or set errors
      if (!amm1 || !amm2) {
        console.error('Reducer: Invalid payload for tokenBalancesLoaded, missing `amm1` or `amm2`');
        state.error = 'Invalid payload for tokenBalancesLoaded';
        return;
      }

      // Ensure the required properties are present in both amm1 and amm2
      if (
        typeof amm1.dappTokenBalance === 'undefined' ||
        typeof amm1.usdTokenBalance === 'undefined' ||
        typeof amm2.dappTokenBalance === 'undefined' ||
        typeof amm2.usdTokenBalance === 'undefined'
      ) {
        console.error('Reducer: Invalid structure for tokenBalancesLoaded payload');
        state.error = 'Invalid structure for tokenBalancesLoaded payload';
        return;
      }

      // If everything is valid, update the balances
      state.amm1Balances = {
        dappTokenBalance: amm1.dappTokenBalance,
        usdTokenBalance: amm1.usdTokenBalance,
      };
      state.amm2Balances = {
        dappTokenBalance: amm2.dappTokenBalance,
        usdTokenBalance: amm2.usdTokenBalance,
      };
      state.error = null; // Clear any previous errors if the payload is valid
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setContracts,
  setSymbols,
  tokenBalancesLoaded,
  setLoading,
  setError,
} = tokens.actions;

export default tokens.reducer;