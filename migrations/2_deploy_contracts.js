const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

let flightSuretyDataInstance;

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
