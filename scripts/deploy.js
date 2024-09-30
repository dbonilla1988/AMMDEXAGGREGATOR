const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory('Token');
  const AMM = await hre.ethers.getContractFactory('AMM');
  const Aggregator = await hre.ethers.getContractFactory('Aggregator');

  // Consider extracting initial parameters from config.json if relevant
  // const config = require('./config.json');
  // const initialSupply = config.initialSupply; // example

  // Deploy Token instances for AMM1
  const dappTokenAMM1 = await Token.deploy('DApp Token for AMM 1', 'DAPP1', '1000000');
  await dappTokenAMM1.deployed();
  console.log(`DApp Token for AMM 1 deployed to: ${dappTokenAMM1.address}`);

  const usdTokenAMM1 = await Token.deploy('USD Token for AMM 1', 'USD1', '1000000');
  await usdTokenAMM1.deployed();
  console.log(`USD Token for AMM 1 deployed to: ${usdTokenAMM1.address}`);

  // Deploy Token instances for AMM2
  const dappTokenAMM2 = await Token.deploy('DApp Token for AMM 2', 'DAPP2', '1000000');
  await dappTokenAMM2.deployed();
  console.log(`DApp Token for AMM 2 deployed to: ${dappTokenAMM2.address}`);

  const usdTokenAMM2 = await Token.deploy('USD Token for AMM 2', 'USD2', '1000000');
  await usdTokenAMM2.deployed();
  console.log(`USD Token for AMM 2 deployed to: ${usdTokenAMM2.address}`);

  // Deploy AMM instances
  const amm1 = await AMM.deploy();
  await amm1.deployed();
  console.log(`AMM 1 contract deployed to: ${amm1.address}`);

  const amm2 = await AMM.deploy();
  await amm2.deployed();
  console.log(`AMM 2 contract deployed to: ${amm2.address}`);

  // Deploy Aggregator with AMM instances
  const aggregator = await Aggregator.deploy(amm1.address, amm2.address);
  await aggregator.deployed();
  console.log(`Aggregator contract deployed to: ${aggregator.address}`);
}

main()
  .then(() => {
    console.log('Deployment completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
