require("@nomicfoundation/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337, // This is the chain ID for your local Hardhat network
      url: "http://localhost:8545", // This is the RPC URL for your local network
    },
    // Add more network configurations if needed
  },
};
