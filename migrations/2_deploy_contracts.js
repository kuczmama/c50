const Token = artifacts.require("./C50.sol");
const Crowdsale = artifacts.require('./C50Crowdsale.sol');

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

module.exports = function(deployer, network, accounts) {
	return deployer
		.then(() => {
			return deployer.deploy(Token);
		}).then(() => {
			function ether (n) {
  				return new web3.BigNumber(web3.toWei(n, 'ether'));
			}

			const openingTime = new Date(Date.now() + duration.minutes(1)).getTime(); // Yesterday
			const closingTime = openingTime + duration.weeks(1);
		  	const rate = new web3.BigNumber(6720);// / (10 ** 18);
			//const wallet = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";
			const wallet = accounts[1];
			const cap = ether(313);//313 * 10 ** 18;

			return deployer.deploy(Crowdsale, openingTime, closingTime, rate, wallet, cap, Token.address);
		});
		
// 	});
}

// Running migration: 1_initial_migration.js
//   Deploying C50Test4...
//   ... 0x638916b003764303ab289225f3d5d9bed7f8716c56043df784f8c5a8d4a6db9c
//   C50Test4: 0xa66eb22170656e9310a469c4ebfc63e9bb59d989
// Saving artifacts...
// Running migration: 2_deploy_contracts.js
//   Running step...
//   Replacing C50Test4...
//   ... 0x92e813e89431e66f7124d1aefe73e4928236c54e77f20f16a66d1e1ace8a7c97
//   C50Test4: 0x413bc643dfc9b3453020fa8a421fee7281ba09db
//   Deploying C50Test4Crowdsale...
//   ... 0x08b877fc8ca140c51efd5cc1013699b900afbe8183ddaae406350e104c384942
//   C50Test4Crowdsale: 0x8fe68e3c58a02f557c3f34f53f6b16c712108696
// Saving artifacts...