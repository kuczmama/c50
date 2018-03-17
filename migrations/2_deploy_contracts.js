const C50 = artifacts.require('./C50.sol');
const C50Crowdsale = artifacts.require('./C50Crowdsale.sol');
const config = require("../truffle.js");
const Web3 = require('web3');
const Promise = require("bluebird");

function sequentialPromiseNamed(promiseObject) {
    const result = Object.keys(promiseObject).reduce(
        (reduced, key) => {
            return {
                chain: reduced.chain
                    .then(() => promiseObject[ key ]())
                    .then(result => reduced.results[ key ] = result),
                results: reduced.results
            };
        },
        {
            chain: Promise.resolve(),
            results: {}
        });
    return result.chain.then(() => result.results);
};

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

module.exports = function(deployer, network, accounts) {
    let web3;
    if (network == 'development') {
        const {
          host,
          port,
        } = config.networks[network]
        web3 = new Web3(new Web3.providers.HttpProvider('http://'+host+':'+port))
    } else if (network == 'ropsten') {
        web3 = new Web3(config.networks[network].provider);
    } else {
        console.log('We are only able to deploy to a local dev network.')
        console.log('To deploy anywhere else you need to set that up.')
        return
    }

    if (typeof web3.eth.getAccountsPromise === "undefined") {
        Promise.promisifyAll(web3.eth, { suffix: "Promise" })
    }
     web3.eth.getBlockPromise('latest').then(block => {
        // console.log("latest block timestamp: " + latestBlock.timestamp);
        // const openingTime = new Date(Date.now() + duration.minutes(1)).getTime(); // Yesterday
        // const closingTime = openingTime + duration.weeks(1);
        // const openingTime = web3.eth.getBlock('latest').timestamp + 2; // two secs in the future
        const openingTime = block.timestamp + duration.minutes(1); // two secs in the future
        const closingTime = openingTime + duration.days(7); // 20 days
        console.log("openingTime: " + openingTime);
        console.log("closingTime: " + closingTime);
        // const tokenAddress = "0x3B6d55A76193544d163E72B1db8fAD2287b24f5A";
        const rate = new web3.BigNumber(6720);
        const cap = web3.toWei(313, "ether");
        // const wallet = accounts[1];
        const wallet = "0x0f48ef66E2C57535654aA4257D75A1AB4B2086A0";

        return deployer
            .then(() => {
                return deployer.deploy(C50);
            })
            .then(() => {
                return deployer.deploy(
                    C50Crowdsale,
                    openingTime,
                    closingTime,
                    rate,
                    wallet,
                    cap,
                    C50.address
                );
            });
    });
};
// // The account that will buy C50 tokens.
// > purchaser = web3.eth.accounts[2]
// '0xddac5d057c79facd674bc95dfd9104076fd34d6b'
// // The address of the C50 token instance that was created when the crowdsale contract was deployed
// // assign the result of C50Crowdsale.deployed() to the variable crowdsale
// > C50Crowdsale.deployed().then(inst => { crowdsale = inst })
// > undefined
// > crowdsale.token().then(addr => { tokenAddress = addr } )
// > tokenAddress
// '0x87a784686ef69304ac0cb1fcb845e03c82f4ce16'
// > C50Instance = C50.at(tokenAddress)
// // change token ownership to crowdsale so it is able to mint tokens during crowdsale
// > C50Instance.transferOwnership(crowdsale.address)
// Now check the number of C50 tokens purchaser has. It should have 0
// C50Instance.balanceOf(purchaser).then(balance => balance.toString(10))
// '0'
// // Buying C50 tokens
// > C50Crowdsale.deployed().then(inst => inst.sendTransaction({ from: purchaser, value: web3.toWei(1, "ether")}))
// { tx: '0x68aa48e1f0d0248835378caa1e5b2051be35a5ff1ded82878683e6072c0a0cfc',
//   receipt:
//    { transactionHash: '0x68aa48e1f0d0248835378caa1e5b2051be35a5ff1ded82878683e6072c0a0cfc',
//      transactionIndex: 0,
//      blockHash: '0xb48ceed99cf6ddd4f081a99474113c4c16ecf61f76625a6559f1686698ee7d57',
//      blockNumber: 5,
//      gasUsed: 68738,
//      cumulativeGasUsed: 68738,
//      contractAddress: null,
//      logs: [] },
//   logs: [] }
// undefined
// // Check the amount of C50 tokens for purchaser again. It should have some now.
// > C50Instance.balanceOf(purchaser).then(balance => purchaserGusTokenBalance = balance.toString(10))
// '5000000000000000000000'
// // When we created our token we made it with 18 decimals, which the same as what ether has. That's a lot of zeros, let's display without the decimals:
// > web3.fromWei(purchaserGusTokenBalance, "ether")
// '5000'

