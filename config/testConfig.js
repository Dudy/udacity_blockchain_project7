
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {

// (0) 0x627306090abab3a6e1400e9345bc60c78a8bef57 (~100 ETH)
// (1) 0xf17f52151ebef6c7334fad080c5704d77216b732 (~100 ETH)
// (2) 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef (~100 ETH)
// (3) 0x821aea9a577a9b44299b9c15c88cf3087f3b5544 (~100 ETH)
// (4) 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2 (~100 ETH)
// (5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e (~100 ETH)
// (6) 0x2191ef87e392377ec08e7c08eb105ef5448eced5 (~100 ETH)
// (7) 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5 (~100 ETH)
// (8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc (~100 ETH)
// (9) 0x5aeda56215b167893e80b4fe645ba6d5bab767de (~100 ETH)
// (10) 0xe44c4cf797505af1527b11e4f4c6f95531b4be24 (~100 ETH)
// (11) 0x69e1cb5cfca8a311586e3406ed0301c06fb839a2 (~100 ETH)
// (12) 0xf014343bdffbed8660a9d8721dec985126f189f3 (~100 ETH)
// (13) 0x0e79edbd6a727cfee09a2b1d0a59f7752d5bf7c9 (~100 ETH)
// (14) 0x9bc1169ca09555bf2721a5c9ec6d69c8073bfeb4 (~100 ETH)
// (15) 0xa23eaef02f9e0338eecda8fdd0a73add781b2a86 (~100 ETH)
// (16) 0xc449a27b106be1120bd1fd62f8166a2f61588eb9 (~100 ETH)
// (17) 0xf24ae9ce9b62d83059bd849b9f36d3f4792f5081 (~100 ETH)
// (18) 0xc44b027a94913fb515b19f04caf515e74ae24fd6 (~100 ETH)
// (19) 0xcb0236b37ff19001633e38808bd124b60b1fe1ba (~100 ETH)
    

    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x69e1CB5cFcA8A311586e3406ed0301C06fb839a2",
        "0xF014343BDFFbED8660A9d8721deC985126f189F3",
        "0x0E79EDbD6A727CfeE09A2b1d0A59F7752d5bf7C9",
        "0x9bC1169Ca09555bf2721A5C9eC6D69c8073bfeB4",
        "0xa23eAEf02F9E0338EEcDa8Fdd0A73aDD781b2A86",
        "0x6b85cc8f612d5457d49775439335f83e12b8cfde",
        "0xcbd22ff1ded1423fbc24a7af2148745878800024",
        "0xc257274276a4e539741ca11b590b9447b26a8051",
        "0x2f2899d6d35b1a48a4fbdc93a37a72f264a9fca7"
    ];

    let owner = accounts[0];
    let firstAirline = accounts[1];
    let flightSuretyData = await FlightSuretyData.new(firstAirline, { from: owner });
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address, { from: owner });
    await flightSuretyData.authorizeCaller(flightSuretyApp.address, { from: owner });
    const JOIN_FEE =  web3.toWei(10,"ether");
    
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};
