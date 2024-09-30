require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    customNetwork: {
      url: "http://localhost:8545", // You can keep this for your custom network
    },
  },
};
