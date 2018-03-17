const C50 = artifacts.require('./C50.sol');
const C50Crowdsale = artifacts.require('./C50Crowdsale.sol');

module.exports = function(deployer, network, accounts) {
    const openingTime = web3.eth.getBlock('latest').timestamp + 2; // two secs in the future
    const closingTime = openingTime + 86400 * 20; // 20 days
    const rate = new web3.BigNumber(6720);
    const cap = web3.toWei(313, "ether");
    const wallet = accounts[1];

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
// > C50Crowdsale.deployed().then(inst => inst.sendTransaction({ from: purchaser, value: web3.toWei(5, "ether")}))
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

