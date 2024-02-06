// src/utils/contracts.js
import { ethers } from 'ethers';
import { AMM_ABI } from '../abis/AMMContract.js';
import { TOKEN_ABI } from '../abis/TokenContract.js';

// Assuming you're using MetaMask or a similar web3 provider
const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
await provider.send("eth_requestAccounts", []); // Request access if needed

const signer = provider.getSigner();

// Token Addresses
const dappTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const usdTokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// AMM Contract Addresses
const ammContractAddress1 = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const ammContractAddress2 = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const dappTokenContract = new ethers.Contract(dappTokenAddress, TOKEN_ABI, signer);
export const usdTokenContract = new ethers.Contract(usdTokenAddress, TOKEN_ABI, signer);

export const ammContract1 = new ethers.Contract(ammContractAddress1, AMM_ABI, signer);
export const ammContract2 = new ethers.Contract(ammContractAddress2, AMM_ABI, signer);
