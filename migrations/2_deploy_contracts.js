const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

// module.exports = function(deployer) {
//     let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';

//     deployer.deploy(FlightSuretyData, firstAirline)
//     .then( () => {
//         return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
//                 .then(async () => {
//                     let config = {
//                         localhost: {
//                             url: 'ws://localhost:8545',
//                             dataAddress: FlightSuretyData.address,
//                             appAddress: FlightSuretyApp.address
//                         }
//                     };

//                     accounts = await web3.eth.getAccounts();
//                     let flightSuretyData = await FlightSuretyData.new(firstAirline);
//                     let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);
//                     await flightSuretyData.authorizeCaller(flightSuretyApp.address);

//                     // fs.writeFile(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//                     // fs.writeFile(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//                     await fs.writeFile(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8', function (err, data) {});
//                     await fs.writeFile(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8', function (err, data) {});
//                 });
//     });
// };


module.exports = async function(deployer) {
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    await deployer.deploy(FlightSuretyData, firstAirline);
    const flightSuretyDataInstance = await FlightSuretyData.deployed();

    await deployer.deploy(FlightSuretyApp, flightSuretyDataInstance.address);
    const flightSuretyAppInstance = await FlightSuretyApp.deployed();

    await flightSuretyDataInstance.authorizeCaller(flightSuretyAppInstance.address);

    let config = {
        localhost: {
            url: 'ws://localhost:8545',
            dataAddress: flightSuretyDataInstance.address,
            appAddress: flightSuretyAppInstance.address
        }
    };

    await fs.writeFile(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8', function (err, data) {});
    await fs.writeFile(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8', function (err, data) {});
};