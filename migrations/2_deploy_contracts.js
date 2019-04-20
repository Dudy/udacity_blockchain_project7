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
//                     //flightSuretyData.authorizeCaller(flightSuretyApp.address);

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


// module.exports = async (deployer) => {
//     let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
//     var flightSuretyDataInstance = await deployer.deploy(flightSuretyData, firstAirline);
// //console.log(flightSuretyDataInstance);
//     var flightSuretyAppInstance = await deployer.deploy(flightSuretyApp, flightSuretyDataInstance.address);
// //console.log(flightSuretyAppInstance);
//     await flightSuretyDataInstance.authorizeCaller(flightSuretyAppInstance.address);
// console.log('flightSuretyApp has been authorized as a caller of flightSuretyData');


//     let config = {
//         localhost: {
//             url: 'http://localhost:8545',
//             dataAddress: flightSuretyData.address,
//             appAddress: flightSuretyApp.address
//         }
//     }
//     fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
//     fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
// };



// module.exports = function(deployer) {
//     let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
//     deployer.deploy(flightSuretyData, firstAirline);
//     deployer.deploy(flightSuretyApp, flightSuretyData.address);
    
//     //flightSuretyData.authorizeCaller(flightSuretyApp.address);

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



// var a, b;
// deployer.then(function() {
//   // Create a new version of A
//   return A.new();
// }).then(function(instance) {
//   a = instance;
//   // Get the deployed instance of B
//   return B.deployed();
// }).then(function(instance) {
//   b = instance;
//   // Set the new instance of A's address on B via B's setA() function.
//   return b.setA(a.address);
// });


module.exports = function(deployer) {
    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';

    let flightSuretyAppInstance;
    let flightSuretyDataInstance;

    deployer.then(function() {
        return flightSuretyData.new(firstAirline);
    }).then(function(dataInstance) {
        flightSuretyDataInstance = dataInstance;
        return flightSuretyApp.new(flightSuretyDataInstance.address);
    }).then(function(appInstance) {
        flightSuretyAppInstance = appInstance;
        flightSuretyDataInstance.authorizeCaller(flightSuretyAppInstance.address);
    }).then(function() {
        let config = {
            localhost: {
                url: 'http://localhost:8545',
                dataAddress: flightSuretyDataInstance.address,
                appAddress: flightSuretyAppInstance.address
            }
        }
        fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
        fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
    });
}