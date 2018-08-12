// Allows us to use ES6 in our migrations and tests.
// require('babel-register')
// let HDWalletProvider = require("truffle-hdwallet-provider");
// let mnemonic = "engine slight photo empower correct modify rib sea raise knock artwork security";
// var infura_apikey = "7dzkhERjQJsad7aNgAHw"; 

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
 //    ropsten: {
 //      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
 //      network_id: 3,
 //      gas: 4500000
	// },
 //    mainnet: {
 //      // https://infura.io/setup?key=7dzkhERjQJsad7aNgAHw
 //      provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/" + infura_apikey),
 //      network_id: 4,
 //      gas: 450000,
 //    }
 //  },
 //  solc: {
 //    optimizer: {
 //      enabled: true,
 //      runs: 200
 //    }
  }
}
