import { ethers } from 'ethers';
import AMM_ABI from '../abis/AMM.json';
import AGGREGATOR_ABI from '../abis/Aggregator.json';
import TOKEN_ABI from '../abis/Token.json';

// Define the provider variable
const provider = new ethers.providers.JsonRpcProvider(); // Replace this with your actual provider

// Deposit actions
export const depositRequest = () => {
  console.log('Deposit request dispatched...');
};

export const depositSuccess = () => {
  console.log('Deposit success dispatched...');
};

export const depositFail = () => {
  console.log('Deposit fail dispatched...');
};

// Withdraw actions
export const withdrawRequest = () => {
  console.log('Withdraw request dispatched...');
};

export const withdrawSuccess = () => {
  console.log('Withdraw success dispatched...');
};

export const withdrawFail = () => {
  console.log('Withdraw fail dispatched...');
};

// Swap actions
export const swapRequest = () => {
  console.log('Swap request dispatched...');
};

export const swapSuccess = () => {
  console.log('Swap success dispatched...');
};

export const swapFail = () => {
  console.log('Swap fail dispatched...');
};

// Swaps loaded action
export const swapsLoaded = (swaps) => ({
  type: 'SWAPS_LOADED',
  payload: swaps,
});

export const setAmmContract = (contractAddress) => ({
  type: 'SET_AMM_CONTRACT',
  payload: contractAddress,
});

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
export const SET_ERROR = 'SET_ERROR';

// Placeholder functions for fetching token balances
const fetchAmm1DappTokenBalance = async () => 100;

const fetchAmm1UsdTokenBalance = async () => 200;

const fetchAmm2DappTokenBalance = async () => 150;

const fetchAmm2UsdTokenBalance = async () => 250;

// Action creators for existing actions
export const setContracts = (contracts) => ({
  type: SET_CONTRACTS,
  payload: contracts,
});

export const setSymbols = (symbols) => ({
  type: SET_SYMBOLS,
  payload: symbols,
});

export const setAmmAddresses = (addresses) => ({
  type: SET_AMM_ADDRESSES,
  payload: addresses,
});

export const setTokens = (tokens) => ({
  type: SET_TOKENS,
  payload: tokens,
});

export const setProvider = (provider) => ({
  type: SET_PROVIDER,
  payload: provider,
});

export const setContract = (contract) => ({
  type: SET_CONTRACT,
  payload: contract,
});

export const setNetwork = (networkId) => ({
  type: SET_NETWORK,
  payload: networkId,
});

export const setAccount = (account) => ({
  type: SET_ACCOUNT,
  payload: account,
});

export const setAggregator = (aggregator) => ({
  type: SET_AGGREGATOR,
  payload: aggregator,
});

// New action creator to set error state
export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

// Action creator to load balances
export const loadBalances = async (provider, dispatch) => {
  try {
    const amm1DappTokenBalance = await fetchAmm1DappTokenBalance();
    const amm1UsdTokenBalance = await fetchAmm1UsdTokenBalance();
    const amm2DappTokenBalance = await fetchAmm2DappTokenBalance();
    const amm2UsdTokenBalance = await fetchAmm2UsdTokenBalance();

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
    
    // Ensure the payload is valid before dispatching
    if (balancesPayload.amm1 && balancesPayload.amm2) {
      dispatch({ type: BALANCES_LOADED, payload: balancesPayload });
    } else {
      console.error('Invalid balances payload', balancesPayload);
      dispatch(setError('Invalid balances payload'));
    }

    console.log('Balances loaded:', balancesPayload);
  } catch (error) {
    console.error('Error loading AMM balances:', error);
    dispatch(setError('Failed to load AMM balances'));
  }
};

// New action creators for fetching prices and setting the best price
export const fetchPriceFromAmm1 = () => ({
  type: 'FETCH_PRICE_FROM_AMM1',
});

export const fetchPriceFromAmm2 = () => ({
  type: 'FETCH_PRICE_FROM_AMM2',
});

export const setBestPrice = (bestPrice) => ({
  type: SET_PRICE,
  payload: bestPrice,
});

// Action creators to update AMM1 balances
export const updateAmm1Balances = (token1Balance, token2Balance) => ({
  type: UPDATE_AMM1_BALANCES,
  payload: { token1Balance, token2Balance },
});

// New action creator for updating AMM2 balances
export const updateAmm2Balances = (token1Balance, token2Balance) => ({
  type: UPDATE_AMM2_BALANCES,
  payload: { token1Balance, token2Balance },
});

// New action creator for loading balances
export const balancesLoaded = (balances) => ({
  type: BALANCES_LOADED,
  payload: balances,
});

// Fetch price data from the Aggregator Contract
export const fetchPriceData = (token1Address, token2Address) => async (dispatch) => {
  const aggregatorAddress = ''; // Fill in the address of the Aggregator Contract
  const aggregatorContract = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, provider);
  try {
    const priceData = await aggregatorContract.getPriceData(token1Address, token2Address);
    console.log('Price data:', priceData);
  } catch (error) {
    console.error('Error fetching price data:', error);
    dispatch(setError('Error fetching price data'));
  }
};

// Interact with the AMM Contract (e.g., add liquidity)
export const addLiquidity = (token1Address, token2Address, amountToken1, amountToken2) => async (dispatch) => {
  const ammAddress = ''; // Fill in the address of the AMM Contract
  const ammContract = new ethers.Contract(ammAddress, AMM_ABI, provider);
  try {
    await ammContract.addLiquidity(token1Address, token2Address, amountToken1, amountToken2);
    console.log('Liquidity added successfully');
  } catch (error) {
    console.error('Error adding liquidity:', error);
    dispatch(setError('Error adding liquidity'));
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
    dispatch({
      type: 'SET_CONTRACT_ADDRESSES',
      payload: { amm1ContractAddress: contractInstance.address },
    });
  } catch (error) {
    console.error('Error setting contract address:', error);
    dispatch(setError('Error setting contract address'));
  }
};

// Fetch token data
export const fetchTokenData = (tokenAddress) => async (dispatch) => {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
    const balance = await tokenContract.balanceOf(tokenAddress);
    const formattedBalance = ethers.utils.formatEther(balance);

    dispatch({
      type: SET_TOKENS,
      payload: {
        tokenAddress,
        balance: formattedBalance,
      },
    });
  } catch (error) {
    console.error('Error fetching token data:', error);
    dispatch(setError('Failed to fetch token data.'));
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
  setError,
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
  fetchTokenData,
};

export default actions;
