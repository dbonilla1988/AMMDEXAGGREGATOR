// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // 1) Deploy DAPP token
  const Token = await ethers.getContractFactory("Token");
  console.log(`Deploying DAPP token...`);
  const dapp = await Token.deploy("DAPP Token", "DAPP", ethers.utils.parseUnits("1000000", 18));
  await dapp.deployed();
  console.log(`DAPP deployed at: ${dapp.address}`);

  // 2) Deploy USD token
  console.log(`Deploying USD token...`);
  const usd = await Token.deploy("USD Token", "USD", ethers.utils.parseUnits("1000000", 18));
  await usd.deployed();
  console.log(`USD deployed at: ${usd.address}`);

  // 3) Deploy AMM1 (no constructor arguments)
  const AMM = await ethers.getContractFactory("AMM");
  console.log(`Deploying AMM1...`);
  const amm1 = await AMM.deploy();
  await amm1.deployed();
  console.log(`AMM1 deployed at: ${amm1.address}`);

  // 4) Deploy AMM2 (no constructor arguments)
  console.log(`Deploying AMM2...`);
  const amm2 = await AMM.deploy();
  await amm2.deployed();
  console.log(`AMM2 deployed at: ${amm2.address}`);

  // 5) Deploy Aggregator with references to AMM1 and AMM2
  const Aggregator = await ethers.getContractFactory("Aggregator");
  console.log(`Deploying Aggregator...`);
  const aggregator = await Aggregator.deploy(amm1.address, amm2.address);
  await aggregator.deployed();
  console.log(`Aggregator deployed at: ${aggregator.address}`);

  console.log(`=== Deployment complete ===`);
  console.log(`DAPP: ${dapp.address}`);
  console.log(`USD:  ${usd.address}`);
  console.log(`AMM1: ${amm1.address}`);
  console.log(`AMM2: ${amm2.address}`);
  console.log(`Aggregator: ${aggregator.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});