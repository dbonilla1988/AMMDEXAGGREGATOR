import { ethers } from 'ethers';
import {
  setProvider,
  setNetwork,
  setAccount,
  withdrawRequest,
  withdrawSuccess,
  withdrawFail,
  swapRequest,
  swapSuccess,
  swapFail,
  swapsLoaded,
  depositRequest,
  depositSuccess,
  depositFail,
  setBestPrice,
  BALANCES_LOADED,
  setSymbols,
  setAggregator,
  setError,
} from './actions';

// Import your extra action if needed:
// import { tokenBalancesLoaded } from './tokens';

import AGGREGATOR_ABI from '../abis/Aggregator.json';
import AMM_ABI from '../abis/AMM.json';
import TOKEN_ABI from '../abis/Token.json';

// -----------------------------------------------------------------------------
// LOAD PROVIDER
// -----------------------------------------------------------------------------
export const loadProvider = (dispatch) => {
  try {
    if (window.ethereum && window.ethereum.isMetaMask) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      provider.getNetwork().then((network) => {
        if (network && network.chainId) {
          dispatch(
            setProvider({
              isConnected: true,
              connection: provider,
              network: network.chainId,
            })
          );
        } else {
          console.error('Failed to retrieve network chainId');
        }
      });

      return provider;
    } else {
      console.error('MetaMask not found or another provider is interfering');
      dispatch(setError('MetaMask not found or another provider is interfering.'));
      return null;
    }
  } catch (error) {
    console.error('Error loading provider:', error.message);
    dispatch(setError(error.message));
    return null;
  }
};

// -----------------------------------------------------------------------------
// LOAD NETWORK
// -----------------------------------------------------------------------------
export const loadNetwork = async (provider, dispatch) => {
  try {
    const { chainId } = await provider.getNetwork();
    dispatch(setNetwork(chainId));
    return chainId;
  } catch (error) {
    console.error('Error loading network:', error.message);
    dispatch(setError(error.message));
  }
};

// -----------------------------------------------------------------------------
// LOAD ACCOUNT
// -----------------------------------------------------------------------------
export const loadAccount = async (dispatch) => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const account = ethers.utils.getAddress(accounts[0]);
    console.log('Account:', account);
    dispatch(setAccount(account));
    return account;
  } catch (error) {
    console.error('Error loading account:', error.message);
    dispatch(setError(error.message));
  }
};

// -----------------------------------------------------------------------------
// LOAD TOKENS
// -----------------------------------------------------------------------------
export const loadTokens = async (provider, dispatch) => {
  try {
    const amm1DappTokenAddress = process.env.REACT_APP_AMM1_DAPP_TOKEN_ADDRESS;
    const amm1UsdTokenAddress = process.env.REACT_APP_AMM1_USD_TOKEN_ADDRESS;
    const amm2DappTokenAddress = process.env.REACT_APP_AMM2_DAPP_TOKEN_ADDRESS;
    const amm2UsdTokenAddress = process.env.REACT_APP_AMM2_USD_TOKEN_ADDRESS;

    // Instantiate ERC20 token contracts
    const dappToken1 = new ethers.Contract(amm1DappTokenAddress, TOKEN_ABI, provider);
    const usdToken1 = new ethers.Contract(amm1UsdTokenAddress, TOKEN_ABI, provider);
    const dappToken2 = new ethers.Contract(amm2DappTokenAddress, TOKEN_ABI, provider);
    const usdToken2 = new ethers.Contract(amm2UsdTokenAddress, TOKEN_ABI, provider);

    // Fetch token symbols
    const symbols = await Promise.all([
      dappToken1.symbol(),
      usdToken1.symbol(),
      dappToken2.symbol(),
      usdToken2.symbol(),
    ]);

    dispatch(setSymbols(symbols));
  } catch (error) {
    console.error('Error loading tokens:', error.message);
    dispatch(setError('Failed to load tokens. Please check contract details.'));
  }
};

// -----------------------------------------------------------------------------
// LOAD AGGREGATOR
// -----------------------------------------------------------------------------
export const loadAggregator = async (provider, dispatch) => {
  try {
    const aggregatorAddress = process.env.REACT_APP_AGGREGATOR_ADDRESS;
    const aggregator = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, provider);

    dispatch(setAggregator(aggregator.address));
    return aggregator;
  } catch (error) {
    console.error('Error loading Aggregator:', error.message);
    dispatch(setError('Failed to load aggregator.'));
  }
};

// -----------------------------------------------------------------------------
// LOAD BALANCES
// -----------------------------------------------------------------------------
export const loadBalances = async (provider, dispatch) => {
  try {
    const amm1Address = process.env.REACT_APP_AMM1_ADDRESS;
    const amm2Address = process.env.REACT_APP_AMM2_ADDRESS;

    const amm1Contract = new ethers.Contract(amm1Address, AMM_ABI, provider);
    const amm2Contract = new ethers.Contract(amm2Address, AMM_ABI, provider);

    const [
      amm1DappTokenBalance,
      amm1UsdTokenBalance,
      amm2DappTokenBalance,
      amm2UsdTokenBalance,
    ] = await Promise.all([
      amm1Contract.getTokenBalance(process.env.REACT_APP_AMM1_DAPP_TOKEN_ADDRESS),
      amm1Contract.getTokenBalance(process.env.REACT_APP_AMM1_USD_TOKEN_ADDRESS),
      amm2Contract.getTokenBalance(process.env.REACT_APP_AMM2_DAPP_TOKEN_ADDRESS),
      amm2Contract.getTokenBalance(process.env.REACT_APP_AMM2_USD_TOKEN_ADDRESS),
    ]);

    const balancesPayload = {
      amm1: {
        dappTokenBalance: ethers.utils.formatEther(amm1DappTokenBalance),
        usdTokenBalance: ethers.utils.formatEther(amm1UsdTokenBalance),
      },
      amm2: {
        dappTokenBalance: ethers.utils.formatEther(amm2DappTokenBalance),
        usdTokenBalance: ethers.utils.formatEther(amm2UsdTokenBalance),
      },
    };

    console.log('Balances Loaded: ', balancesPayload);

    // If using the simpler approach:
    dispatch({ type: BALANCES_LOADED, payload: balancesPayload });

    // Or if using tokenBalancesLoaded from your tokens slice:
    // dispatch(tokenBalancesLoaded(balancesPayload));

  } catch (error) {
    console.error('Error loading AMM balances:', error.message);
    dispatch(setError('Failed to load AMM balances.'));
  }
};

// -----------------------------------------------------------------------------
// FETCH PRICE DATA
// -----------------------------------------------------------------------------
export const fetchPriceData = (token1Address, token2Address, provider) => async (dispatch) => {
  try {
    const aggregatorAddress = process.env.REACT_APP_AGGREGATOR_ADDRESS;
    const aggregatorContract = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, provider);

    const priceData = await aggregatorContract.getPrice(token1Address, token2Address);
    dispatch(setBestPrice(priceData));
  } catch (error) {
    console.error('Error fetching price data:', error.message);
    dispatch(setError('Failed to fetch price data.'));
  }
};

// -----------------------------------------------------------------------------
// ADD LIQUIDITY
// -----------------------------------------------------------------------------
export const addLiquidity = async (provider, amm, tokens, amounts, dispatch) => {
  try {
    dispatch(depositRequest());

    const signer = provider.getSigner();

    await Promise.all([
      tokens[0].connect(signer).approve(amm.address, amounts[0]),
      tokens[1].connect(signer).approve(amm.address, amounts[1]),
    ]);

    const transaction = await amm.connect(signer).addLiquidity(amounts[0], amounts[1]);
    await transaction.wait();

    dispatch(depositSuccess(transaction.hash));
    return { success: true, message: 'Liquidity added successfully' };
  } catch (error) {
    console.error('Error adding liquidity:', error.message);
    dispatch(depositFail());
    dispatch(setError('Failed to add liquidity.'));
  }
};

// -----------------------------------------------------------------------------
// REMOVE LIQUIDITY
// -----------------------------------------------------------------------------
export const removeLiquidity = async (provider, amm, shares, dispatch) => {
  try {
    dispatch(withdrawRequest());

    const signer = provider.getSigner();
    const transaction = await amm.connect(signer).removeLiquidity(shares);
    await transaction.wait();

    dispatch(withdrawSuccess(transaction.hash));
    return { success: true, message: 'Liquidity removed successfully' };
  } catch (error) {
    console.error('Error removing liquidity:', error.message);
    dispatch(withdrawFail());
    dispatch(setError('Failed to remove liquidity.'));
  }
};

// -----------------------------------------------------------------------------
// SWAP
// -----------------------------------------------------------------------------
export const swap = async (provider, amm, tokenIn, tokenOut, amountIn, dispatch) => {
  try {
    dispatch(swapRequest());

    const signer = provider.getSigner();
    await tokenIn.connect(signer).approve(amm.address, amountIn);

    const transaction = await amm.connect(signer).swap(tokenIn.address, tokenOut.address, amountIn);
    await transaction.wait();

    dispatch(swapSuccess(transaction.hash));
    return { success: true, message: 'Swap successful' };
  } catch (error) {
    console.error('Error swapping tokens:', error.message);
    dispatch(swapFail());
    dispatch(setError('Failed to swap tokens.'));
  }
};

// -----------------------------------------------------------------------------
// LOAD ALL SWAPS
// -----------------------------------------------------------------------------
export const loadAllSwaps = async (provider, amm, dispatch) => {
  const block = await provider.getBlockNumber();
  const swapStream = await amm.queryFilter('Swap', 0, block);

  const swaps = swapStream.map((event) => ({
    hash: event.transactionHash,
    args: event.args,
  }));

  dispatch(swapsLoaded(swaps));
};

// -----------------------------------------------------------------------------
// WATCH FOR ACCOUNT CHANGES
// -----------------------------------------------------------------------------
export const watchAccountChanges = (provider, dispatch) => {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length > 0) {
      const account = ethers.utils.getAddress(accounts[0]);
      dispatch(setAccount(account));
    } else {
      dispatch(setError('No accounts found'));
    }
  });
};

// -----------------------------------------------------------------------------
// WATCH FOR NETWORK CHANGES
// -----------------------------------------------------------------------------
export const watchNetworkChanges = (provider, dispatch) => {
  window.ethereum.on('chainChanged', async () => {
    await loadNetwork(provider, dispatch);
    await loadTokens(provider, dispatch);
    await loadAggregator(provider, dispatch);
    await loadBalances(provider, dispatch);
  });
};

// -----------------------------------------------------------------------------
// CONNECT WALLET
// -----------------------------------------------------------------------------
export const connectWallet = async (provider, dispatch) => {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // eslint-disable-next-line no-unused-vars
    const account = await loadAccount(dispatch);
    // eslint-disable-next-line no-unused-vars
    const chainId = await loadNetwork(provider, dispatch);

    await loadTokens(provider, dispatch);
    await loadAggregator(provider, dispatch);
    await loadBalances(provider, dispatch);

    watchAccountChanges(provider, dispatch);
    watchNetworkChanges(provider, dispatch);
  } catch (error) {
    console.error('Error connecting to wallet:', error.message);
    dispatch(setError('Failed to connect wallet.'));
  }
};

// -----------------------------------------------------------------------------
// DISCONNECT WALLET
// -----------------------------------------------------------------------------
export const disconnectWallet = async (dispatch) => {
  dispatch(setAccount(null));
  dispatch(setNetwork(null));
  console.log('Wallet disconnected from application.');
};