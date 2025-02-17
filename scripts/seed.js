// scripts/seed.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Latest deployed addresses from the logs
  const DAPP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const USD_ADDRESS  = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const AMM1_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const AMM2_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  // Attach
  const Token = await ethers.getContractFactory("Token");
  const dapp = Token.attach(DAPP_ADDRESS);
  const usd  = Token.attach(USD_ADDRESS);

  const AMM = await ethers.getContractFactory("AMM");
  const amm1 = AMM.attach(AMM1_ADDRESS);
  const amm2 = AMM.attach(AMM2_ADDRESS);

  // Mint tokens (optional, but you do so here)
  console.log("Minting tokens to deployer...");
  await (await dapp.transfer(deployer.address, ethers.utils.parseUnits("100000", 18))).wait();
  await (await usd.transfer(deployer.address, ethers.utils.parseUnits("100000", 18))).wait();

  console.log(
    `DAPP Balance of deployer: ${ethers.utils.formatUnits(
      await dapp.balanceOf(deployer.address),
      18
    )}`
  );
  console.log(
    `USD Balance of deployer: ${ethers.utils.formatUnits(
      await usd.balanceOf(deployer.address),
      18
    )}`
  );

  // Approve tokens for AMM1
  console.log("Approving tokens for AMM1...");
  await (await dapp.approve(AMM1_ADDRESS, ethers.utils.parseUnits("50000", 18))).wait();
  await (await usd.approve(AMM1_ADDRESS, ethers.utils.parseUnits("50000", 18))).wait();

  console.log("Adding 1000 DAPP & 1000 USD liquidity to AMM1...");
  await (
    await amm1.addLiquidity(
      DAPP_ADDRESS,
      USD_ADDRESS,
      ethers.utils.parseUnits("1000", 18),
      ethers.utils.parseUnits("1000", 18)
    )
  ).wait();

  // Approve tokens for AMM2
  console.log("Approving tokens for AMM2...");
  await (await dapp.approve(AMM2_ADDRESS, ethers.utils.parseUnits("50000", 18))).wait();
  await (await usd.approve(AMM2_ADDRESS, ethers.utils.parseUnits("50000", 18))).wait();

  console.log("Adding 1000 DAPP & 1000 USD liquidity to AMM2...");
  await (
    await amm2.addLiquidity(
      DAPP_ADDRESS,
      USD_ADDRESS,
      ethers.utils.parseUnits("1000", 18),
      ethers.utils.parseUnits("1000", 18)
    )
  ).wait();

  // Verify reserves after adding liquidity
  console.log("Fetching reserves from AMM1...");
  let [reserveDappAMM1, reserveUsdAMM1] = await amm1.getReserves(DAPP_ADDRESS, USD_ADDRESS);
  console.log(
    `AMM1 Reserves - DAPP: ${ethers.utils.formatUnits(
      reserveDappAMM1,
      18
    )}, USD: ${ethers.utils.formatUnits(reserveUsdAMM1, 18)}`
  );

  console.log("Fetching reserves from AMM2...");
  let [reserveDappAMM2, reserveUsdAMM2] = await amm2.getReserves(DAPP_ADDRESS, USD_ADDRESS);
  console.log(
    `AMM2 Reserves - DAPP: ${ethers.utils.formatUnits(
      reserveDappAMM2,
      18
    )}, USD: ${ethers.utils.formatUnits(reserveUsdAMM2, 18)}`
  );

  console.log("✅ Seeding completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});