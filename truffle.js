var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  networks: {
    // development: {
    //   host: "127.0.0.1",
    //   port: 8545,
    //   network_id: '*',
    //   gas: 5000000,
    //   gasPrice: 32,
    // }
    development: {
        host: "127.0.0.1",
        port: 8545,
        network_id: '*',
        gas: 5000000,
        gasPrice: 32,
        accounts: 50,
        defaultEtherBalance: 1000,
        mnemonic: mnemonic
      }
  },
  compilers: {
    solc: {
      version: "^0.4.25"
    }
  }
};

