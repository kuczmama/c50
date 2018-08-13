const C50 = artifacts.require("./C50V2.sol");

module.exports = function(deployer, network, accounts) {
	return deployer.deploy(C50, {from: "0x20684DacBDf92A919b2C0820A2E51a0C29c266aE"});
}
