const hre = require("hardhat");
const { ethers } = hre;

main = async () => {
  [deployer] = await ethers.getSigners();
  console.log("Deployer address = ", deployer.address);

  const MonkeyCoinAvax = await ethers.getContractFactory("MonkeyCoinAvax");
  const monkeyCoin = await MonkeyCoinAvax.deploy("210000000000"); // total supply = 210 B
  await monkeyCoin.deployed();
  console.log("MonkeyCoinAvax deployed at", monkeyCoin.address);

  const MKCBridgeAvax = await ethers.getContractFactory("MKCBridgeAvax");
  const bridge = await MKCBridgeAvax.deploy(
    monkeyCoin.address,
    "10000000000000000"
  ); // 0.01 AVAX
  await bridge.deployed();
  console.log("MKCBridgeAvax deployed at", bridge.address);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
