# 50 Cryptos in 1 - Buy 1 own them all

<img align="right" src="http://www.c50index.com/wp-content/uploads/2018/05/c50-finallogo2b1-1-e1526222711779-206x300.png" alt="c50 Index">

There are thousands of new crypto projects popping up in the world. It takes too much time and skill to sift through all of them.  Why do so much work trying to pick a winner when you can own C50 instead?

C50 is a token backed by the top 50 cryptocurrencies.

It is a simple, safe, and secure way to diversify into crypto in one transaction. No hassle. No stress. No missing out on the next big thing.
Criteria

## All coins and tokens that are included in the C50 Index must meet the following criteria.

- Minimum of one-year since being listed on an exchange
- Yearly average market capitalization of $70 million USD
- Daily trade volume of $1 million
- 50% of the total supply publicly tradable
- Not backed by fiat or commodities (ex. Tether)
- Not backed by other financial instruments
- Not an index of coins or tokens

## Testing
```sh
export PATH=$(dirname $(nodenv which npm)):$PATH; node --inspect-brk $(which truffle) test test/C50V2.test.js
chrome://inspect/
```


## How to deploy c50 on Ropsten

1. Update owner address in 1_initial_migration.js
       const C50 = artifacts.require("./C50V2.sol");
       - Make sure the from address is completely lowercase

```js 
  //return deployer.deploy(C50, [owner address], {from: [creator address]});

  module.exports = function(deployer, network, accounts) {
  
    return deployer.deploy(C50, "0x3ff32898abff9c57e3ae04ca4a3565d4c81b209e", {from: "0xd6ea58a0149400e6d35b3b0e3e06ff20b8479cb0"});
  }

```

2. Run the command

```sh
    truffle migrate --network ropsten
```

1. Check to make sure it works.  Also set the gasPrice to gasPrice: 2500000000

```js
    module.exports = {
      networks: {
        development: {
          host: '127.0.0.1',
          port: 7545,
          network_id: '*', // Match any network id
          gas: 4500000,
          gasPrice: 2500000000, //  Default is 100,000,000,000 (100 Shannon).
        },
        ropsten: {
          provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
          network_id: 3,
          gas: 4500000
          gasPrice: 2500000000
    	},
        mainnet: {
          provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/" + infura_apikey),
          network_id: 4,
          gas: 450000,
          gasPrice: 2500000000
        }

```

# To Interact with the contract

1. Go to the contracts tab on myetherwallet https://www.myetherwallet.com/#contracts

2. Add the contract address and the ABI.  The ABI will be found in c50/build/contracts/C50V2.json.  You will need to copy only the ABI part, if you copy anything else you won't be able to do transactions.  
```js
{
  "contractName": "C50V2",
  "abi": [copy everything here],
}
```
Note: When you paste in the contract address, make sure it is the checksummed address.  WHich means the address will be uppercase and lowercase letters. https://kb.myetherwallet.com/addresses/what-does-checksummed-mean.html


<img align="right" src="https://user-images.githubusercontent.com/5359580/44953719-2c09b900-aed2-11e8-9477-e5004253fbd3.png" alt="My Ether Wallet Contract Tab">

3. Do your transaction with your wallet provider, ie. Trezor, Ledger, Metamask, etc.
