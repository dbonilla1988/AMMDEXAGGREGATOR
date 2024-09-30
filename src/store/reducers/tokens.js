import { createSlice } from '@reduxjs/toolkit'; // Ensure this is imported

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
    balancesLoaded: (state, action) => {
      const { amm1, amm2 } = action.payload || {};

      // Log the payload for debugging
      console.log('Reducer: Payload received in balancesLoaded:', action.payload);

      // Error handling if either amm1 or amm2 is missing in the payload
      if (!amm1 || !amm2) {
        console.error('Reducer: Invalid payload for balancesLoaded, missing `amm1` or `amm2`');
        state.error = 'Invalid payload for balancesLoaded';
        return;
      }

      // Additional logging to verify the structure of amm1 and amm2
      console.log('Reducer: AMM1 Balances:', amm1);
      console.log('Reducer: AMM2 Balances:', amm2);

      // Check if all balances exist before updating the state
      if (
        amm1.dappTokenBalance !== undefined &&
        amm1.usdTokenBalance !== undefined &&
        amm2.dappTokenBalance !== undefined &&
        amm2.usdTokenBalance !== undefined
      ) {
        state.amm1Balances = amm1;
        state.amm2Balances = amm2;
        state.error = null; // Clear any previous errors
      } else {
        console.error('Reducer: Missing balances for AMM1 or AMM2 in the payload');
        state.error = 'Missing balances for AMM1 or AMM2';
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setContracts, setSymbols, balancesLoaded, setLoading, setError } = tokens.actions;
export default tokens.reducer;