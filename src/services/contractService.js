import { ethers } from 'ethers';
import AMM_ABI from '../abis/AMM.json';
import TOKEN_ABI from '../abis/Token.json';
import AGGREGATOR_ABI from '../abis/Aggregator.json';

let contracts = {}; // Object to store contract instances

/**
 * Initializes contracts for the given provider, config, and network chainId.
 * This function sets up all the contract instances and stores them in a contracts object.
 *
 * @param {ethers.providers.Provider} provider - The Ethereum provider
 * @param {Object} config - The configuration JSON containing contract addresses
 * @param {number} chainId - The network chainId for the current provider
 */
export const initContracts = (provider, config, chainId) => {
  const networkConfig = config[chainId];

  if (!networkConfig) {
    throw new Error(`No configuration found for chainId ${chainId}`);
  }

  // Initialize and store contract instances
  contracts = {
    dappToken1: new ethers.Contract(networkConfig.amm1.dappTokenAddress, TOKEN_ABI, provider),
    usdToken1: new ethers.Contract(networkConfig.amm1.usdTokenAddress, TOKEN_ABI, provider),
    dappToken2: new ethers.Contract(networkConfig.amm2.dappTokenAddress, TOKEN_ABI, provider),
    usdToken2: new ethers.Contract(networkConfig.amm2.usdTokenAddress, TOKEN_ABI, provider),
    amm1: new ethers.Contract(networkConfig.amm1.ammAddress, AMM_ABI, provider),
    amm2: new ethers.Contract(networkConfig.amm2.ammAddress, AMM_ABI, provider),
    aggregator: new ethers.Contract(networkConfig.aggregator.address, AGGREGATOR_ABI, provider)
  };

  console.log('Contracts initialized:', contracts);
};

/**
 * Retrieves a specific contract instance by name.
 * Ensure that initContracts has been called before using this function.
 *
 * @param {string} name - The name of the contract to retrieve
 * @returns {ethers.Contract} - The contract instance
 */
export const getContract = (name) => {
  if (!contracts[name]) {
    throw new Error(`Contract ${name} has not been initialized. Make sure to call initContracts first.`);
  }
  return contracts[name];
};

/**
 * Clear the contracts from memory if needed (for re-initialization or cleanup)
 */
export const clearContracts = () => {
  contracts = {};
  console.log('Contracts cleared');
};