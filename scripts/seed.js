const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    const Token = await hre.ethers.getContractFactory("Token");
    const AMM = await hre.ethers.getContractFactory("AMM");

    // Updated token addresses for AMM 1
    const dappTokenAMM1 = Token.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
    const usdTokenAMM1 = Token.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

    // Updated token addresses for AMM 2
    const dappTokenAMM2 = Token.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    const usdTokenAMM2 = Token.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");

    // Updated AMM contract addresses
    const amm1 = AMM.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");
    const amm2 = AMM.attach("0x5FC8d32690cc91D4c39d9d3abcBD16989F875707");

    // Approve AMM contracts to spend tokens
    await dappTokenAMM1.connect(deployer).approve(amm1.address, hre.ethers.utils.parseEther("1000"));
    await usdTokenAMM1.connect(deployer).approve(amm1.address, hre.ethers.utils.parseEther("1000"));

    await dappTokenAMM2.connect(deployer).approve(amm2.address, hre.ethers.utils.parseEther("1000"));
    await usdTokenAMM2.connect(deployer).approve(amm2.address, hre.ethers.utils.parseEther("1000"));

    // Add liquidity to AMM contracts
    await amm1.connect(deployer).addLiquidity(dappTokenAMM1.address, usdTokenAMM1.address, hre.ethers.utils.parseEther("1000"), hre.ethers.utils.parseEther("1000"));
    await amm2.connect(deployer).addLiquidity(dappTokenAMM2.address, usdTokenAMM2.address, hre.ethers.utils.parseEther("1000"), hre.ethers.utils.parseEther("1000"));

    console.log("Liquidity added to both AMMs");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
