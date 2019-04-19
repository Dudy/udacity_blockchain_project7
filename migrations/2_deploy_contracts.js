console.log('my migration starts');

const flightSuretyApp = artifacts.require("FlightSuretyApp");
const flightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

// module.exports = function(deployer) {

//     let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
//     deployer.deploy(flightSuretyData, firstAirline)
//     .then(() => {
//         return deployer.deploy(flightSuretyApp, flightSuretyData.address)
//                 .then(() => {
//                     let config = {
//                         localhost: {
//                             url: 'http://localhost:8545',
//                             dataAddress: flightSuretyData.address,
//                             appAddress: flightSuretyApp.address
//                         }
//                     }
//                     fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//                     fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//                 });
//     });
// }


// module.exports = async function(deployer) {

//     let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
//     await deployer.deploy(flightSuretyData, firstAirline);
//     await deployer.deploy(flightSuretyApp, flightSuretyData.address);
//     //await flightSuretyData.authorizeCaller(flightSuretyApp.address);
//     //console.log('flightSuretyApp has been authorized as a caller of flightSuretyData');

//     let config = {
//         localhost: {
//             url: 'http://localhost:8545',
//             dataAddress: flightSuretyData.address,
//             appAddress: flightSuretyApp.address
//         }
//     }
//     fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//     fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
// }


module.exports = async (deployer) => {
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    var flightSuretyDataInstance = await deployer.deploy(flightSuretyData, firstAirline);
//console.log(flightSuretyDataInstance);
    var flightSuretyAppInstance = await deployer.deploy(flightSuretyApp, flightSuretyDataInstance.address);
//console.log(flightSuretyAppInstance);
    await flightSuretyDataInstance.authorizeCaller(flightSuretyAppInstance.address);
console.log('flightSuretyApp has been authorized as a caller of flightSuretyData');


    let config = {
        localhost: {
            url: 'http://localhost:8545',
            dataAddress: flightSuretyData.address,
            appAddress: flightSuretyApp.address
        }
    }
    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
};