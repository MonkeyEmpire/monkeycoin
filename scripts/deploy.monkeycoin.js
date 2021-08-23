const hre = require("hardhat");
const { ethers } = hre;

main = async () => {
  [deployer] = await ethers.getSigners();
  console.log("Deployer address = ", deployer.address);

  // depositToken
  const MonkeyCoin = await ethers.getContractFactory("MonkeyCoin");
  const monkeyCoin = await MonkeyCoin.deploy("210000000000"); // total supply = 210 B
  await monkeyCoin.deployed();
  console.log("MonkeyCoin deployed at", monkeyCoin.address);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
