const Token = artifacts.require("./C50.sol");
const Crowdsale = artifacts.require('./C50Crowdsale.sol');

module.exports = function(deployer, network, accounts) {
	return deployer.deploy(Token);
}
