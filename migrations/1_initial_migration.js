const C50 = artifacts.require("./C50V2.sol");

module.exports = function(deployer, network, accounts) {
	return deployer.deploy(C50, "0x3ff32898abff9c57e3ae04ca4a3565d4c81b209e", {from: "0xd6ea58a0149400e6d35b3b0e3e06ff20b8479cb0"});
}
