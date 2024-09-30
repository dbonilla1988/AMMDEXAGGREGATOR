import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

// Async thunk to connect to Ethereum provider and get the account
export const connectProvider = createAsyncThunk('provider/connectProvider', async (_, { rejectWithValue }) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    const network = await provider.getNetwork();

    return { provider, account, chainId: network.chainId };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const providerSlice = createSlice({
  name: 'provider',
  initialState: {
    connection: null,
    chainId: null,
    account: '',
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(connectProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.connection = action.payload.provider;
        state.account = action.payload.account;
        state.chainId = action.payload.chainId;
      })
      .addCase(connectProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default providerSlice.reducer;