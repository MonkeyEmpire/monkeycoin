const TokenBsc = artifacts.require("MkcBsc.sol");

module.exports = async (done) => {
  const [recipient, _] = await web3.eth.getAccounts();
  const tokenBsc = await TokenBsc.deployed();
  const balance = await tokenBsc.balanceOf(recipient);
  console.log(balance.toString());
  done();
};
