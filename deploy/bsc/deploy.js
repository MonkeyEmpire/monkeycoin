const hre = require("hardhat");
const { ethers } = hre;

main = async () => {
  [deployer] = await ethers.getSigners();
  console.log("Deployer address = ", deployer.address);

  // depositToken
  const MonkeyCoinBsc = await ethers.getContractFactory("MonkeyCoinBsc");
  const monkeyCoin = await MonkeyCoinBsc.deploy(); // total supply = 210 B
  await monkeyCoin.deployed();
  console.log("MonkeyCoinBsc deployed at", monkeyCoin.address);

  const MKCBridgeBsc = await ethers.getContractFactory("MKCBridgeBsc");
  const bridge = await MKCBridgeBsc.deploy(
    "0xE82c4ce37F381242E9082c28c84936778dFCc1D3",
    "100000"
  ); // 0.001 BSC
  await bridge.deployed();
  console.log("MKCBridgeBsc deployed at", bridge.address);

  await monkeyCoin.setMinter(bridge.address);
  console.log("MonkeyCoinBSC: set minter as MKCBridgeBsc");
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
