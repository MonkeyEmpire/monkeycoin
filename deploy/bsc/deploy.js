const hre = require("hardhat");
const { ethers } = hre;

main = async () => {
  [deployer] = await ethers.getSigners();
  console.log("Deployer address = ", deployer.address);

  // depositToken
  const MonkeyCoinBsc = await ethers.getContractFactory("MonkeyCoinBsc");
  const monkeyCoin = await MonkeyCoinBsc.deploy(
    ethers.utils.parseUnits("210000000000")
  ); // max supply = 210 B
  await monkeyCoin.deployed();
  console.log("MonkeyCoinBsc deployed at", monkeyCoin.address);

  const MKCBridgeBsc = await ethers.getContractFactory("MKCBridgeBsc");
  const bridge = await MKCBridgeBsc.deploy(
    monkeyCoin.address,
    "1000000000000000"
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
