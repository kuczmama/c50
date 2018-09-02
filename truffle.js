// Allows us to use ES6 in our migrations and tests.
require('babel-register')
let HDWalletProvider = require("truffle-hdwallet-provider");
let mnemonic = "wrestle outdoor refuse wrong breeze black sea soon salmon cricket suspect improve";
var infura_apikey = "7dzkhERjQJsad7aNgAHw"; 

//https://truffleframework.com/docs/truffle/reference/configuration
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
      gas: 4500000,
      gasPrice: 2500000000,
	},
    mainnet: {
      // https://infura.io/setup?key=7dzkhERjQJsad7aNgAHw
      provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/" + infura_apikey),
      network_id: 4,
      gas: 450000,
      gasPrice: 2500000000,
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
