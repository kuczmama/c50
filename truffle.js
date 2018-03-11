// Allows us to use ES6 in our migrations and tests.
require('babel-register')
let HDWalletProvider = require("truffle-hdwallet-provider");
let mnemonic = "syrup decrease pact nerve hedgehog law ostrich rug toddler clever ranch taxi";
var infura_apikey = "KbQuP7xkP1ZYNhJkUOXF"; 

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
      network_id: 3,
      gas: 4500000
	}
  }//,
  // solc: {
  //   optimizer: {
  //     enabled: true,
  //     runs: 200
  //   }
  // }
}
