require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // Make sure to import dotenv

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.REACT_APP_SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY], // an array of private keys
      chainId: 11155111,
    },
  },
};