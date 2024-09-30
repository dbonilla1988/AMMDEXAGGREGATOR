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
} from './actions';
import config from '../config.json';
import { initContracts, getContract } from '../services/contractService';
import AGGREGATOR_ABI from '../abis/Aggregator.json';
import AMM_ABI from '../abis/AMM.json';

// Load provider
export const loadProvider = (dispatch) => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.getNetwork().then((network) => {
        if (network && network.chainId) {
          dispatch(setProvider({ isConnected: true, connection: provider, network: network.chainId }));
        } else {
          console.error('Failed to retrieve network chainId');
        }
      }).catch((err) => {
        console.error('Error retrieving network:', err);
      });
      return provider;
    } else {
      console.error('Please install MetaMask or another Ethereum wallet provider');
    }
  } catch (error) {
    console.error('Error loading provider:', error.message);
  }
};

// Load network
export const loadNetwork = async (provider, dispatch) => {
  try {
    const { chainId } = await provider.getNetwork();
    dispatch(setNetwork(chainId));
    return chainId;
  } catch (error) {
    console.error('Error loading network:', error.message);
  }
};


// Load account with error handling
export const loadAccount = async (dispatch) => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // eslint-disable-next-line no-unused-vars
    const account = ethers.utils.getAddress(accounts[0]);
    console.log('Account:', account); // This uses the account variable
    dispatch(setAccount(account)); // This also uses the account variable
    return account;
  } catch (error) {
    console.error('Error loading account:', error.message);
  }
};

// Load tokens
export const loadTokens = async (provider, chainId, dispatch) => {
  try {
    initContracts(provider, config, chainId);

    const symbols = await Promise.all([
      getContract('dappToken1').symbol(),
      getContract('usdToken1').symbol(),
      getContract('dappToken2').symbol(),
      getContract('usdToken2').symbol(),
    ]);

    dispatch(setSymbols(symbols));
  } catch (error) {
    console.error('Error loading tokens:', error.message);
  }
};

// Load aggregator
export const loadAggregator = async (provider, chainId, dispatch) => {
  try {
    const aggregator = getContract('aggregator');
    dispatch(setAggregator(aggregator.address));
    return aggregator;
  } catch (error) {
    console.error('Error loading Aggregator:', error.message);
  }
};

// Load balances
export const loadBalances = async (provider, dispatch) => {
  try {
    const network = await provider.getNetwork();
    const chainIdStr = network.chainId.toString();
    console.log(`Retrieved chainId: ${chainIdStr}`);

    const configForChain = config[chainIdStr];
    if (!configForChain || !configForChain.amm1 || !configForChain.amm2) {
      console.error(`Config missing for chainId: ${chainIdStr} or AMMs are not defined`);
      return;
    }

    const amm1Contract = new ethers.Contract(configForChain.amm1.ammAddress, AMM_ABI, provider);
    const amm2Contract = new ethers.Contract(configForChain.amm2.ammAddress, AMM_ABI, provider);

    const [amm1DappTokenBalance, amm1UsdTokenBalance, amm2DappTokenBalance, amm2UsdTokenBalance] = await Promise.all([
      amm1Contract.getTokenBalance(configForChain.amm1.dappTokenAddress),
      amm1Contract.getTokenBalance(configForChain.amm1.usdTokenAddress),
      amm2Contract.getTokenBalance(configForChain.amm2.dappTokenAddress),
      amm2Contract.getTokenBalance(configForChain.amm2.usdTokenAddress),
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

    dispatch({ type: BALANCES_LOADED, payload: balancesPayload });
  } catch (error) {
    console.error('Error loading AMM balances:', error);
  }
};
// Fetch price data
export const fetchPriceData = (token1Address, token2Address, provider) => async (dispatch) => {
  try {
    const aggregatorAddress = config['31337'].aggregator.address;
    if (!aggregatorAddress) {
      console.error('Aggregator address is missing');
      return;
    }

    const aggregatorContract = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, provider);
    const priceData = await aggregatorContract.getPriceData(token1Address, token2Address);
    dispatch(setBestPrice(priceData));
  } catch (error) {
    console.error('Error fetching price data:', error);
  }
};

// Add liquidity
export const addLiquidity = async (provider, amm, tokens, amounts, dispatch) => {
  try {
    dispatch(depositRequest());

    const signer = await provider.getSigner();

    let transaction = await tokens[0].connect(signer).approve(amm.address, amounts[0]);
    await transaction.wait();

    transaction = await tokens[1].connect(signer).approve(amm.address, amounts[1]);
    await transaction.wait();

    transaction = await amm.connect(signer).addLiquidity(amounts[0], amounts[1]);
    await transaction.wait();

    dispatch(depositSuccess(transaction.hash));
    return { success: true, message: 'Liquidity added successfully' };
  } catch (error) {
    console.error('Error adding liquidity:', error.message);
    dispatch(depositFail());
    return { success: false, message: 'Failed to add liquidity' };
  }
};

// Remove liquidity
export const removeLiquidity = async (provider, amm, shares, dispatch) => {
  try {
    dispatch(withdrawRequest());

    const signer = await provider.getSigner();

    let transaction = await amm.connect(signer).removeLiquidity(shares);
    await transaction.wait();

    dispatch(withdrawSuccess(transaction.hash));
    return { success: true, message: 'Liquidity removed successfully' };
  } catch (error) {
    console.error('Error removing liquidity:', error.message);
    dispatch(withdrawFail());
    return { success: false, message: 'Failed to remove liquidity' };
  }
};

// Swap tokens
export const swap = async (provider, amm, tokenIn, tokenOut, amountIn, dispatch) => {
  try {
    dispatch(swapRequest());

    const signer = await provider.getSigner();

    let transaction = await tokenIn.connect(signer).approve(amm.address, amountIn);
    await transaction.wait();

    transaction = await amm.connect(signer).swap(tokenIn.address, tokenOut.address, amountIn);
    await transaction.wait();

    dispatch(swapSuccess(transaction.hash));
    return { success: true, message: 'Swap successful' };
  } catch (error) {
    console.error('Error swapping tokens:', error.message);
    dispatch(swapFail());
    return { success: false, message: 'Swap failed' };
  }
};

// Load all swaps
export const loadAllSwaps = async (provider, amm, dispatch) => {
  const block = await provider.getBlockNumber();
  const swapStream = await amm.queryFilter('Swap', 0, block);
  const swaps = swapStream.map((event) => {
    return { hash: event.transactionHash, args: event.args };
  });

  dispatch(swapsLoaded(swaps));
};

// Watch for account changes
export const watchAccountChanges = (provider, dispatch) => {
  window.ethereum.on('accountsChanged', (accounts) => {
    const account = ethers.utils.getAddress(accounts[0]);
    console.log('Account changed:', account);
    dispatch(setAccount(account));
  });
};

// Watch for network changes
export const watchNetworkChanges = (provider, dispatch) => {
  window.ethereum.on('chainChanged', async (chainId) => {
    console.log('Network changed:', chainId);
    await loadNetwork(provider, dispatch);
    await loadTokens(provider, chainId, dispatch);
    await loadAggregator(provider, chainId, dispatch);
    await loadBalances(provider, dispatch);
  });
};

// Connect to wallet
export const connectWallet = async (provider, dispatch) => {
  try {
    await provider.request({ method: 'eth_requestAccounts' });
    console.log('Wallet connected');
    const account = await loadAccount(dispatch);
    const chainId = await loadNetwork(provider, dispatch);

    await loadTokens(provider, chainId, dispatch);
    await loadAggregator(provider, chainId, dispatch);
    await loadBalances(provider, dispatch);

    watchAccountChanges(provider, dispatch);
    watchNetworkChanges(provider, dispatch);
  } catch (error) {
    console.error('Error connecting to wallet:', error.message);
  }
};


// Disconnect wallet
// Disconnect wallet
export const disconnectWallet = async (dispatch) => {
  try {
    dispatch(setAccount(null));
    dispatch(setNetwork(null));
    console.log('Wallet disconnected from application.');
  } catch (error) {
    console.error('Error disconnecting wallet:', error.message);
  }
};
