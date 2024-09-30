import { ethers } from 'ethers';
import AMM_ABI from '../abis/AMM.json';
import AGGREGATOR_ABI from '../abis/Aggregator.json';

// Define the provider variable
const provider = new ethers.providers.JsonRpcProvider(); // Replace this with your actual provider

// Deposit actions
export const depositRequest = () => {
  console.log('Deposit request dispatched...');
  // Function implementation
};

export const depositSuccess = () => {
  console.log('Deposit success dispatched...');
  // Function implementation
};

export const depositFail = () => {
  console.log('Deposit fail dispatched...');
  // Function implementation
};

// Withdraw actions
export const withdrawRequest = () => {
  console.log('Withdraw request dispatched...');
  // Function implementation
};

export const withdrawSuccess = () => {
  console.log('Withdraw success dispatched...');
  // Function implementation
};

export const withdrawFail = () => {
  console.log('Withdraw fail dispatched...');
  // Function implementation
};

// Swap actions
export const swapRequest = () => {
  console.log('Swap request dispatched...');
  // Function implementation
};

export const swapSuccess = () => {
  console.log('Swap success dispatched...');
  // Function implementation
};

export const swapFail = () => {
  console.log('Swap fail dispatched...');
  // Function implementation
};

// Swaps loaded action
export const swapsLoaded = (swaps) => {
  console.log('Swaps loaded:', swaps);
  return {
    type: 'SWAPS_LOADED',
    payload: swaps,
  };
};

// Add the setAmmContract action
export const setAmmContract = (contractAddress) => {
  console.log('Amm contract set:', contractAddress);
  return {
    type: 'SET_AMM_CONTRACT',
    payload: contractAddress,
  };
};

// Action types
export const SET_CONTRACTS = 'SET_CONTRACTS';
export const SET_SYMBOLS = 'SET_SYMBOLS';
export const SET_AMM_ADDRESSES = 'SET_AMM_ADDRESSES';
export const SET_TOKENS = 'SET_TOKENS';
export const SET_PROVIDER = 'SET_PROVIDER';
export const SET_NETWORK = 'SET_NETWORK';
export const SET_ACCOUNT = 'SET_ACCOUNT';
export const SET_AGGREGATOR = 'SET_AGGREGATOR';
export const SET_CONTRACT = 'SET_CONTRACT';
export const SET_PRICE = 'SET_PRICE';
export const UPDATE_AMM1_BALANCES = 'UPDATE_AMM1_BALANCES';
export const UPDATE_AMM2_BALANCES = 'UPDATE_AMM2_BALANCES';
export const BALANCES_LOADED = 'BALANCES_LOADED';
export const SET_CONTRACT_ADDRESSES = 'SET_CONTRACT_ADDRESSES';

// Placeholder functions for fetching token balances
const fetchAmm1DappTokenBalance = async () => {
  return 100;
};

const fetchAmm1UsdTokenBalance = async () => {
  return 200;
};

const fetchAmm2DappTokenBalance = async () => {
  return 150;
};

const fetchAmm2UsdTokenBalance = async () => {
  return 250;
};

// Action creators for existing actions
export const setContracts = (contracts) => {
  console.log('Contracts set:', contracts);
  return {
    type: SET_CONTRACTS,
    payload: contracts,
  };
};

export const setSymbols = (symbols) => {
  console.log('Symbols set:', symbols);
  return {
    type: SET_SYMBOLS,
    payload: symbols,
  };
};

export const setAmmAddresses = (addresses) => {
  console.log('AMM addresses set:', addresses);
  return {
    type: SET_AMM_ADDRESSES,
    payload: addresses,
  };
};

export const setTokens = (tokens) => {
  console.log('Tokens set:', tokens);
  return {
    type: SET_TOKENS,
    payload: tokens,
  };
};

export const setProvider = (provider) => {
  console.log('Provider set:', provider);
  return {
    type: SET_PROVIDER,
    payload: provider,
  };
};

export const setContract = (contract) => {
  console.log('Contract set:', contract);
  return {
    type: SET_CONTRACT,
    payload: contract,
  };
};

export const setNetwork = (networkId) => {
  console.log('Network ID set:', networkId);
  return {
    type: SET_NETWORK,
    payload: networkId,
  };
};

export const setAccount = (account) => {
  console.log('Account set:', account);
  return {
    type: SET_ACCOUNT,
    payload: account,
  };
};

export const setAggregator = (aggregator) => {
  console.log('Aggregator set:', aggregator);
  return {
    type: SET_AGGREGATOR,
    payload: aggregator,
  };
};

// Action creator to load balances
export const loadBalances = async (provider, dispatch) => {
  try {
    const amm1DappTokenBalance = await fetchAmm1DappTokenBalance();
    const amm1UsdTokenBalance = await fetchAmm1UsdTokenBalance();
    const amm2DappTokenBalance = await fetchAmm2DappTokenBalance();
    const amm2UsdTokenBalance = await fetchAmm2UsdTokenBalance();

    const balancesPayload = {
      amm1: { dappTokenBalance: ethers.utils.formatEther(amm1DappTokenBalance), usdTokenBalance: ethers.utils.formatEther(amm1UsdTokenBalance) },
      amm2: { dappTokenBalance: ethers.utils.formatEther(amm2DappTokenBalance), usdTokenBalance: ethers.utils.formatEther(amm2UsdTokenBalance) },
    };
    dispatch({ type: BALANCES_LOADED, payload: balancesPayload });

    console.log('Balances loaded:', balancesPayload);
  } catch (error) {
    console.error('Error loading AMM balances:', error);
    throw new Error('Failed to load AMM balances');
  }
};

// New action creators for fetching prices and setting the best price
export const fetchPriceFromAmm1 = () => {
  console.log('Fetching price from AMM1...');
  return {
    type: 'FETCH_PRICE_FROM_AMM1',
  };
};

export const fetchPriceFromAmm2 = () => {
  console.log('Fetching price from AMM2...');
  return {
    type: 'FETCH_PRICE_FROM_AMM2',
  };
};

export const setBestPrice = (bestPrice) => {
  console.log('Best price set:', bestPrice);
  return {
    type: SET_PRICE,
    payload: bestPrice,
  };
};

// Action creators to update AMM1 balances
export const updateAmm1Balances = (token1Balance, token2Balance) => ({
  type: UPDATE_AMM1_BALANCES,
  payload: { token1Balance, token2Balance }
});

// New action creator for updating AMM2 balances
export const updateAmm2Balances = (token1Balance, token2Balance) => ({
  type: UPDATE_AMM2_BALANCES,
  payload: { token1Balance, token2Balance }
});

// New action creator for loading balances
export const balancesLoaded = (balances) => {
  console.log('Balances loaded:', balances);
  return {
    type: BALANCES_LOADED,
    payload: balances,
  };
};

// Action creators for interacting with the Aggregator and AMM contracts

// Fetch price data from the Aggregator Contract
export const fetchPriceData = (token1Address, token2Address) => async (dispatch) => {
  const aggregatorAddress = ''; // Fill in the address of the Aggregator Contract
  const aggregatorContract = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, provider); // Make sure 'provider' is defined
  try {
    const priceData = await aggregatorContract.getPriceData(token1Address, token2Address);
    console.log('Price data:', priceData);
  } catch (error) {
    console.error('Error fetching price data:', error);
  }
};

// Interact with the AMM Contract (e.g., add liquidity)
export const addLiquidity = (token1Address, token2Address, amountToken1, amountToken2) => async (dispatch) => {
  const ammAddress = ''; // Fill in the address of the AMM Contract
  const ammContract = new ethers.Contract(ammAddress, AMM_ABI, provider); // Make sure 'provider' is defined
  try {
    await ammContract.addLiquidity(token1Address, token2Address, amountToken1, amountToken2);
    console.log('Liquidity added successfully');
  } catch (error) {
    console.error('Error adding liquidity:', error);
  }
};

// Added setContractAddresses action
export const setContractAddresses = (contractAddresses) => ({
  type: 'SET_CONTRACT_ADDRESSES',
  payload: contractAddresses,
});

// Dispatch the action to set the contract address
export const setContractAddress = (contractInstance) => async (dispatch) => {
  try {
    dispatch({ type: 'SET_CONTRACT_ADDRESSES', payload: { amm1ContractAddress: contractInstance.address }});
  } catch (error) {
    console.error('Error setting contract address:', error);
  }
};

// Updated actions object
const actions = {
  depositRequest,
  depositSuccess,
  depositFail,
  withdrawRequest,
  withdrawSuccess,
  withdrawFail,
  swapRequest,
  swapSuccess,
  swapFail,
  swapsLoaded,
  setAmmContract,
  setSymbols,
  setAmmAddresses,
  setTokens,
  setProvider,
  setContract,
  setNetwork,
  setAccount,
  setAggregator,
  loadBalances,
  fetchPriceFromAmm1,
  fetchPriceFromAmm2,
  setBestPrice,
  updateAmm1Balances,
  updateAmm2Balances,
  balancesLoaded,
  fetchPriceData,
  addLiquidity,
  setContractAddresses,
  setContractAddress,
};

export default actions;
