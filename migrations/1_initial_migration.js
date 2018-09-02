const C50 = artifacts.require("./C50V2.sol");

module.exports = function(deployer, network, accounts) {
	return deployer.deploy(C50, accounts[1], {from: "0x171a848F509eF3d9c150F82114d94E26eA6c4A0E"});
}
