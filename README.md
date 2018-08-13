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


## How to deploy c50

1. Update owner address in 1_initial_migration.js
       const C50 = artifacts.require("./C50V2.sol");
       - Make sure the from address is completelyu lowercase

```js       
       module.exports = function(deployer, network, accounts) {
       	return deployer.deploy(C50, {from: "0x20684Dacbdf92a919b2C0820a2e51a0C29c266ae"});
       }
```

2. Run the command

```sh
    truffle migrate --network development
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
