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
    } else if (network == 'mainnet') {
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
        const openingTime = block.timestamp + duration.minutes(1); // two secs in the future
        const closingTime = openingTime + duration.minutes(30); // 20 days
        // const tokenAddress = "0x3B6d55A76193544d163E72B1db8fAD2287b24f5A";
        const rate = new web3.BigNumber(6720);
        const cap = web3.toWei(313, "ether");
        // const wallet = accounts[1];
        // const wallet = "0x0f48ef66E2C57535654aA4257D75A1AB4B2086A0";
        // const tokenWallet = accounts[2];
        const wallet = "0x0f48ef66E2C57535654aA4257D75A1AB4B2086A0";
        const tokenWallet = "0x0f48ef66E2C57535654aA4257D75A1AB4B2086A0";
        const crowdsaleAmount = new web3.BigNumber('2.1e24');

        return deployer
            .then(() => {
                return deployer.deploy(C50);
            })
            // .then( async () => {
            //     let crowdsale = deployer.deploy(
            //         C50Crowdsale,
            //         openingTime,
            //         closingTime,
            //         rate,
            //         wallet,
            //         cap,
            //         tokenWallet,
            //         C50.address
            //     );

            //     // await this.token.transfer(tokenWallet, crowdsaleAmount, {from: owner});

            //     return crowdsale;

            // });
    });
};

//  token.approve(crowdsale.address, new web3.BigNumber('2.1e24'), { from: "0x992f045555f568d7022994f6f30373517127f13d" })
//  crowdsale.then(inst => inst.sendTransaction({ from: purchaser, value: web3.toWei(1, "ether")}))

// // The account that will buy C50 tokens.
// crowdsale = C50Crowdsale.at("0x1e062e011137ec5f66232eb97b0cdb98a9671f27")
// > purchaser = web3.eth.accounts[2]
// '0xddac5d057c79facd674bc95dfd9104076fd34d6b'
// // The address of the C50 token instance that was created when the crowdsale contract was deployed
// // assign the result of C50Crowdsale.deployed() to the variable crowdsale
// > crowdsale = C50Crowdsale.at(crowdsaleAddress);
// > undefined
// > crowdsale.token().then(addr => { tokenAddress = addr } )
// > tokenAddress
// '0x87a784686ef69304ac0cb1fcb845e03c82f4ce16'
// > token = C50.at(tokenAddress)
// tokenWallet = crowdsale.tokenWallet();
// Increase approval of crowdsale
// crowdsale = C50Crowdsale.at("0x1e062e011137ec5f66232eb97b0cdb98a9671f27")
// token.increaseApproval(tokenWallet, new web3.BigNumber('2.1e24'));
// token.increaseApproval(crowdsaleAddress, new web3.BigNumber('2.1e24'))
// token.transfer(tokenWallet, new web3.BigNumber('2.4e24'));
// token.balanceOf(purchaser).then(balance => balance.toString(10))
// '0'
// // Buying C50 tokens
// token.increaseApproval("0x992f045555f568d7022994f6f30373517127f13d", new web3.BigNumber('2.4e24'))
// > crowdsale.then(inst => inst.sendTransaction({ from: purchaser, value: web3.toWei(1, "ether")}))
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
// > token.balanceOf(purchaser).then(balance => purchaserGusTokenBalance = balance.toString(10))
// '5000000000000000000000'
// // When we created our token we made it with 18 decimals, which the same as what ether has. That's a lot of zeros, let's display without the decimals:
// > web3.fromWei(purchaserGusTokenBalance, "ether")
// '5000'

