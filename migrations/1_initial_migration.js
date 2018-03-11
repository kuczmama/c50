const Token = artifacts.require("./C50Test4.sol");
const Crowdsale = artifacts.require('./C50Test4Crowdsale.sol');

module.exports = function(deployer, network, accounts) {
	return deployer.deploy(Token);
}
