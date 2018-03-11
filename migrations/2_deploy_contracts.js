const Token = artifacts.require("./C50Test4.sol");
const Crowdsale = artifacts.require('./C50Test4Crowdsale.sol');

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
			const wallet = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";
			const cap = ether(313);//313 * 10 ** 18;

			return deployer.deploy(Crowdsale, openingTime, closingTime, rate, wallet, cap, Token.address);
		});
		
// 	});
}
