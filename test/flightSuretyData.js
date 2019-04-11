var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {
    var config;

    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    // check operational status

    // it('(multiparty) has correct initial isOperational() value', async function () {
    //     let status = await config.flightSuretyData.isOperational.call();
    //     assert.equal(status, true, "Incorrect initial operating status value");
    // });

    // it('(multiparty) can block access to setOperatingStatus() for non-Contract Owner account', async function () {
    //     let accessDenied = false;
    //     try {
    //         await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
    //     } catch(e) {
    //         accessDenied = true;
    //     }
    //     assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
    // });

    // it('(multiparty) can allow access to setOperatingStatus() for Contract Owner account', async function () {
    //     let accessDenied = false;
    //     try {
    //         await config.flightSuretyData.setOperatingStatus(false, { from: config.owner });
    //     } catch(e) {
    //         accessDenied = true;
    //     }
    //     assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    // });

    // it('(multiparty) can block access to functions using requireIsOperational when operating status is false', async function () {
    //     await config.flightSuretyData.setOperatingStatus(false);
    
    //     let reverted = false;
    //     try {
    //         await config.flightSuretyData.registerAirline(accounts[2], {from: config.firstAirline});
    //     } catch(e) {
    //         reverted = true;
    //     }
    //     assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

    //     await config.flightSuretyData.setOperatingStatus(true);
    // });

    // // authorization

    // it('check that app contract is authorized on data contract', async function() {
    //     let status = await config.flightSuretyData.isCallerAuthorized.call(config.flightSuretyApp.address);
    //     assert.equal(status, true, "App contract is not authorized on data contract");
    // });

    // it('contract owner can authorize a caller', async function() {
    //     let errorFree = true;
    //     try {
    //         await config.flightSuretyData.authorizeCaller(config.testAddresses[2]);
    //     } catch(e) {
    //         errorFree = false;
    //     }
    //     assert.equal(errorFree, true, "Authorization attemp threw an error");

    //     let status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
    //     assert.equal(status, true, "Authorization not successful");
    // });

    // it('contract non-owner cannot authorize a caller', async function() {
    //     let errorFree = true;
    //     try {
    //         await config.flightSuretyData.authorizeCaller(config.testAddresses[3], { from: config.testAddresses[4] });
    //     } catch(e) {
    //         errorFree = false;
    //     }
    //     assert.equal(errorFree, false, "Authorization attemp did not threw an expected error");

    //     let status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[3]);
    //     assert.equal(status, false, "Authorization unexpectedly successful");
    // });

    // it('contract owner can unauthorize a caller', async function() {
    //     await config.flightSuretyData.authorizeCaller(config.testAddresses[2]);
    //     let status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
    //     assert.equal(status, true, "Account is not authorized");

    //     let errorFree = true;
    //     try {
    //         await config.flightSuretyData.unauthorizeCaller(config.testAddresses[2]);
    //     } catch(e) {
    //         errorFree = false;
    //     }
    //     assert.equal(errorFree, true, "Unauthorization attemp threw an error");

    //     status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
    //     assert.equal(status, false, "Unauthorization not successful");
    // });

    // it('contract non-owner cannot unauthorize a caller', async function() {
    //     await config.flightSuretyData.authorizeCaller(config.testAddresses[2]);
    //     let status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
    //     assert.equal(status, true, "Account is not authorized");

    //     let errorFree = true;
    //     try {
    //         await config.flightSuretyData.unauthorizeCaller(config.testAddresses[2], { from: testAddresses[3] });
    //     } catch(e) {
    //         errorFree = false;
    //     }
    //     assert.equal(errorFree, false, "Unauthorization attemp did not threw an expected error");

    //     status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
    //     assert.equal(status, true, "Unauthorization unexpectedly successful");
    // });

    // // airline registration

    // it('when the data contract is not operational then it should not be possible to register a new airline', async function() {
    //     await config.flightSuretyData.setOperatingStatus(false);
    
    //     let reverted = false;
    //     try {
    //         await config.flightSuretyData.registerAirline(accounts[2], {from: config.firstAirline});
    //     } catch(e) {
    //         reverted = true;
    //         assert.equal(e.message, "VM Exception while processing transaction: revert Contract is currently not operational", "wrong exception occurred");
    //     }
    //     assert.equal(reverted, true, "Access not blocked for requireIsOperational");

    //     await config.flightSuretyData.setOperatingStatus(true);
    // });

    // it('when the caller is not authorized then it should not be possible to register a new airline', async function() {
    //     let reverted = false;
    //     try {
    //         await config.flightSuretyData.registerAirline(accounts[2], {from: config.firstAirline});
    //     } catch(e) {
    //         assert.equal(e.message, "VM Exception while processing transaction: revert Caller not authorized", "wrong exception occurred");
    //         reverted = true;
    //     }
    //     assert.equal(reverted, true, "Caller is not authorized, but call succeeded");
    // });

    // it('when the caller is not a registered airline then it should not be possible to register a new airline', async function() {
    //     await config.flightSuretyData.setOperatingStatus(true);
    //     await config.flightSuretyData.authorizeCaller(accounts[4]);

    //     let registrationSuccessful = true;
    //     try {
    //         await config.flightSuretyData.registerAirline(accounts[5], {from: accounts[4]});
    //     } catch(e) {
    //         assert.equal(e.message, "VM Exception while processing transaction: revert Caller is not a registered airline", "wrong exception occurred");
    //         registrationSuccessful = false;
    //     }
    //     assert.equal(registrationSuccessful, false, "Caller is not registered, but call succeeded");
    // });

    // it('when the calling airline has not yet paid it\'s funds then it should not be possible to register a new airline', async function() {
    //     await config.flightSuretyData.setOperatingStatus(true);
    //     await config.flightSuretyData.authorizeCaller(config.firstAirline);
    //     await config.flightSuretyData.authorizeCaller(accounts[5]);

    //     let registrationSuccessful = true;
    //     try {
    //         await config.flightSuretyData.registerAirline(accounts[5], {from: config.firstAirline});
    //     } catch(e) {
    //         assert.equal(e.message, "VM Exception while processing transaction: revert Calling airline has not yet paid their funds", "wrong exception occurred");
    //         registrationSuccessful = false;
    //     }
    //     assert.equal(registrationSuccessful, false, "Caller has not paid funds, but call succeeded");

    //     await config.flightSuretyData.unauthorizeCaller(config.firstAirline);
    // });

    // TODO
    // it('when the calling airline has not yet paid it\'s funds then it should not be possible to register a new airline', async function() {
    //     await config.flightSuretyData.setOperatingStatus(true);
    //     await config.flightSuretyData.authorizeCaller(config.firstAirline);
    //     await config.flightSuretyData.authorizeCaller(accounts[5]);

    //     let registrationSuccessful = true;
    //     try {
    //         await config.flightSuretyData.registerAirline(accounts[5], {from: config.firstAirline});
    //     } catch(e) {
    //         assert.equal(e.message, "VM Exception while processing transaction: revert Airline already registered", "wrong exception occurred");
    //         registrationSuccessful = false;
    //     }
    //     assert.equal(registrationSuccessful, false, "Airline already registered, but call succeeded");

    //     await config.flightSuretyData.unauthorizeCaller(config.firstAirline);
    // });

    it('overfund airline', async function() {
        await config.flightSuretyData.setOperatingStatus(true);
        await config.flightSuretyData.authorizeCaller(config.firstAirline);

        const firstAirlineBalanceBefore = await web3.eth.getBalance(config.firstAirline);
        const dataBalanceBefore = await web3.eth.getBalance(config.flightSuretyData.address);

        await config.flightSuretyData.fund({ from: config.firstAirline, value: web3.toWei('12', 'ether') });

        const firstAirlineBalanceAfter = await web3.eth.getBalance(config.firstAirline);
        const dataBalanceAfter = await web3.eth.getBalance(config.flightSuretyData.address);
        const blockchainCost = 974464;

        assert.equal(dataBalanceBefore.add(web3.toWei('10', 'ether')).eq(dataBalanceAfter), true, 'data contract has not received the correct amount of money');
        assert.equal(firstAirlineBalanceAfter.add(web3.toWei('10', 'ether')).add(blockchainCost).eq(firstAirlineBalanceBefore), true, 'firstAirline has not paid the correct amount of money');
        
        await config.flightSuretyData.unauthorizeCaller(config.firstAirline);
    });
    






//   it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
//     let newAirline = accounts[2];
//     let reverted = false;

//     // ACT
//     try {
//         await config.flightSuretyData.registerAirline(newAirline, {from: config.firstAirline});
//     } catch(e) {
// console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeee");
// console.log(e);
//         reverted = true;
//     }
//     let result = await config.flightSuretyData.isAirline.call(newAirline); 

//     // ASSERT
//     assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
//   });
 

});
