// const flightSuretyApp = artifacts.require("FlightSuretyApp");
// const flightSuretyData = artifacts.require("FlightSuretyData");
// const fs = require('fs');

// module.exports = function(deployer) {
//     let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';

//     let flightSuretyAppInstance;
//     let flightSuretyDataInstance;

//     deployer.then(function() {
//         return flightSuretyData.new(firstAirline);
//     }).then(function(dataInstance) {
//         flightSuretyDataInstance = dataInstance;
//         return flightSuretyApp.new(flightSuretyDataInstance.address);
//     }).then(function(appInstance) {
//         flightSuretyAppInstance = appInstance;
//         flightSuretyDataInstance.authorizeCaller(flightSuretyAppInstance.address);
//     }).then(function() {
//         flightSuretyDataInstance.airlineFunding({ from: firstAirline, value: web3.toWei('10', 'ether') });
//     }).then(function() {
//         let config = {
//             localhost: {
//                 url: 'http://localhost:8545',
//                 dataAddress: flightSuretyDataInstance.address,
//                 appAddress: flightSuretyAppInstance.address
//             }
//         }
//         fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//         fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//     });
// }


// const FlightSuretyApp = artifacts.require("FlightSuretyApp");
// const FlightSuretyData = artifacts.require("FlightSuretyData");
// const fs = require('fs');

// registerFirstAirline = undefined;
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

//                     //let flightSuretyData = await FlightSuretyData.new(firstAirline);
//                     //let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

//                 await sleep(20000);

//                     await FlightSuretyData.authorizeCaller(FlightSuretyApp.address);

//                     await fs.writeFile(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8', function (err, data) {});
//                     await fs.writeFile(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8', function (err, data) {});
//                 });
//     });
// };

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }


const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

let flightSuretyDataInstance;
let flightSuretyAppInstance;

module.exports = function(deployer) {
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    deployer.deploy(FlightSuretyData, firstAirline)
    .then(() => FlightSuretyData.deployed())
    .then((dataInstance) => { flightSuretyDataInstance = dataInstance; deployer.deploy(FlightSuretyApp, dataInstance.address); })
    .then(() => FlightSuretyApp.deployed())
    .then((appInstance) => console.log("app: " + appInstance.address))
    .then(() => flightSuretyDataInstance.authorizeCaller(FlightSuretyApp.address))
    .then(() => flightSuretyDataInstance.isCallerAuthorized(FlightSuretyApp.address))
    .then((authorizationStatus) => console.log('authorizationStatus: ' + authorizationStatus))
    .then(() => {
        let config = {
            localhost: {
                url: 'http://localhost:8545',
                dataAddress: FlightSuretyData.address,
                appAddress: FlightSuretyApp.address
            }
        }
        fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
        fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
    });
};



// const flightSuretyApp = artifacts.require("FlightSuretyApp");
// const flightSuretyData = artifacts.require("FlightSuretyData");
// const fs = require('fs');

// module.exports = function(deployer) {
//     let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';

//     let flightSuretyAppInstance;
//     let flightSuretyDataInstance;

//     deployer.then(function() {
//         return flightSuretyData.new(firstAirline);
//     }).then(function(dataInstance) {
//         flightSuretyDataInstance = dataInstance;
//         return flightSuretyApp.new(flightSuretyDataInstance.address);
//     }).then(function(appInstance) {
//         flightSuretyAppInstance = appInstance;
//         flightSuretyDataInstance.authorizeCaller(flightSuretyAppInstance.address);
//     }).then(function() {
//         flightSuretyDataInstance.airlineFunding({ from: firstAirline, value: web3.toWei('10', 'ether') });
//     }).then(function() {
//         let config = {
//             localhost: {
//                 url: 'http://localhost:8545',
//                 dataAddress: flightSuretyDataInstance.address,
//                 appAddress: flightSuretyAppInstance.address
//             }
//         }
//         fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//         fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//     });
// }