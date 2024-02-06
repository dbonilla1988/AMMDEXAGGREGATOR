const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory('Token');

  // Deploy Token 1
  let dapp = await Token.deploy('Dapp Token', 'DAPP', '1000000'); // 1 million tokens
  await dapp.deployed();
  console.log(`Dapp Token deployed to: ${dapp.address}\n`);

  // Deploy Token 2
  const usd = await Token.deploy('USD Token', 'USD', '1000000'); // 1 million tokens
  await usd.deployed();
  console.log(`USD Token deployed to: ${usd.address}\n`);

  // Deploy AMM 1
  const AMM = await hre.ethers.getContractFactory('AMM');
  const amm1 = await AMM.deploy(dapp.address, usd.address);
  await amm1.deployed();
  console.log(`First AMM contract deployed to: ${amm1.address}\n`);

  // Deploy AMM 2 (a second instance)
  const amm2 = await AMM.deploy(dapp.address, usd.address);
  await amm2.deployed();
  console.log(`Second AMM contract deployed to: ${amm2.address}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
