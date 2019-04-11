var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {
    var config;

    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    // check operational status

    it('(multiparty) has correct initial isOperational() value', async function () {
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it('(multiparty) can block access to setOperatingStatus() for non-Contract Owner account', async function () {
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        } catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
    });

    it('(multiparty) can allow access to setOperatingStatus() for Contract Owner account', async function () {
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.owner });
        } catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it('(multiparty) can block access to functions using requireIsOperational when operating status is false', async function () {
        await config.flightSuretyData.setOperatingStatus(false);
    
        let reverted = false;
        try {
            await config.flightSuretyData.registerAirline(accounts[2], {from: config.firstAirline});
        } catch(e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

        await config.flightSuretyData.setOperatingStatus(true);
    });

    // authorization

    it('check that app contract is authorized on data contract', async function() {
        let status = await config.flightSuretyData.isCallerAuthorized.call(config.flightSuretyApp.address);
        assert.equal(status, true, "App contract is not authorized on data contract");
    });

    it('contract owner can authorize a caller', async function() {
        let errorFree = true;
        try {
            await config.flightSuretyData.authorizeCaller(config.testAddresses[2]);
        } catch(e) {
            errorFree = false;
        }
        assert.equal(errorFree, true, "Authorization attemp threw an error");

        let status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
        assert.equal(status, true, "Authorization not successful");
    });

    it('contract non-owner cannot authorize a caller', async function() {
        let errorFree = true;
        try {
            await config.flightSuretyData.authorizeCaller(config.testAddresses[3], { from: config.testAddresses[4] });
        } catch(e) {
            errorFree = false;
        }
        assert.equal(errorFree, false, "Authorization attemp did not threw an expected error");

        let status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[3]);
        assert.equal(status, false, "Authorization unexpectedly successful");
    });

    it('contract owner can unauthorize a caller', async function() {
        await config.flightSuretyData.authorizeCaller(config.testAddresses[2]);
        let status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
        assert.equal(status, true, "Account is not authorized");

        let errorFree = true;
        try {
            await config.flightSuretyData.unauthorizeCaller(config.testAddresses[2]);
        } catch(e) {
            errorFree = false;
        }
        assert.equal(errorFree, true, "Unauthorization attemp threw an error");

        status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
        assert.equal(status, false, "Unauthorization not successful");
    });

    it('contract non-owner cannot unauthorize a caller', async function() {
        await config.flightSuretyData.authorizeCaller(config.testAddresses[2]);
        let status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
        assert.equal(status, true, "Account is not authorized");

        let errorFree = true;
        try {
            await config.flightSuretyData.unauthorizeCaller(config.testAddresses[2], { from: testAddresses[3] });
        } catch(e) {
            errorFree = false;
        }
        assert.equal(errorFree, false, "Unauthorization attemp did not threw an expected error");

        status = await config.flightSuretyData.isCallerAuthorized.call(config.testAddresses[2]);
        assert.equal(status, true, "Unauthorization unexpectedly successful");
    });

    // airline registration

    it('when the data contract is not operational then it should not be possible to register a new airline', async function() {
        await config.flightSuretyData.setOperatingStatus(false);
    
        let reverted = false;
        try {
            await config.flightSuretyData.registerAirline(accounts[2], {from: config.firstAirline});
        } catch(e) {
            reverted = true;
            assert.equal(e.message, "VM Exception while processing transaction: revert Contract is currently not operational", "wrong exception occurred");
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        await config.flightSuretyData.setOperatingStatus(true);
    });

    it('when the caller is not authorized then it should not be possible to register a new airline', async function() {
        let reverted = false;
        try {
            await config.flightSuretyData.registerAirline(accounts[2], {from: config.firstAirline});
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert Caller not authorized", "wrong exception occurred");
            reverted = true;
        }
        assert.equal(reverted, true, "Caller is not authorized, but call succeeded");
    });

    it('when the caller is not a registered airline then it should not be possible to register a new airline', async function() {
        await config.flightSuretyData.setOperatingStatus(true);
        await config.flightSuretyData.authorizeCaller(accounts[4]);

        let registrationSuccessful = true;
        try {
            await config.flightSuretyData.registerAirline(accounts[5], {from: accounts[4]});
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert Caller is not a registered airline", "wrong exception occurred");
            registrationSuccessful = false;
        }
        assert.equal(registrationSuccessful, false, "Caller is not registered, but call succeeded");
    });

    it('when the calling airline has not yet paid it\'s funds then it should not be possible to register a new airline', async function() {
        await config.flightSuretyData.setOperatingStatus(true);
        await config.flightSuretyData.authorizeCaller(config.firstAirline);

        let registrationSuccessful = true;
        try {
            await config.flightSuretyData.registerAirline(accounts[5], {from: config.firstAirline});
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert Calling airline has not yet paid their funds", "wrong exception occurred");
            registrationSuccessful = false;
        }
        assert.equal(registrationSuccessful, false, "Caller has not paid funds, but call succeeded");

        await config.flightSuretyData.unauthorizeCaller(config.firstAirline);
    });

    it('registration of a new airline when there one, two, three, four or five already registered airlines', async function() {
        await config.flightSuretyData.setOperatingStatus(true);
        await config.flightSuretyData.authorizeCaller(config.firstAirline);

        try {
            await config.flightSuretyData.defund({ from: config.firstAirline });
        } catch(e) {
            // noop
        }
        await config.flightSuretyData.fund({ from: config.firstAirline, value: web3.toWei('10', 'ether') });
        await config.flightSuretyData.authorizeCaller(config.firstAirline);

        for (var i = 2; i < 20; i++) {
            try {
                await config.flightSuretyData.unregisterAirline(accounts[i], { from: config.firstAirline });
            } catch(e) {
                // noop
            }
        }

        let numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 1, "there should be exactly one registered airline (the \"firstAirline\"");

        await config.flightSuretyData.registerAirline(accounts[2], {from: config.firstAirline});
        let registered = await config.flightSuretyData.isAirlineRegistered(accounts[2]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 2, "there should be exactly two registered airlines");

        await config.flightSuretyData.registerAirline(accounts[3], {from: config.firstAirline});
        registered = await config.flightSuretyData.isAirlineRegistered(accounts[3]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 3, "there should be exactly three registered airlines");

        await config.flightSuretyData.registerAirline(accounts[4], {from: config.firstAirline});
        registered = await config.flightSuretyData.isAirlineRegistered(accounts[4]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 4, "there should be exactly four registered airlines");

        await config.flightSuretyData.registerAirline(accounts[5], {from: config.firstAirline});
        registered = await config.flightSuretyData.isAirlineRegistered(accounts[5]);
        assert.equal(registered, false, "Airline is registered, but it should not be");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 4, "there should still be exactly four registered airlines");
    });

    it('registration of a new sixth airline by three other', async function() {
        await config.flightSuretyData.setOperatingStatus(true);
        await config.flightSuretyData.authorizeCaller(config.firstAirline);

        try {
            await config.flightSuretyData.defund({ from: config.firstAirline });
        } catch(e) {
            // noop
        }
        await config.flightSuretyData.fund({ from: config.firstAirline, value: web3.toWei('10', 'ether') });
        await config.flightSuretyData.authorizeCaller(config.firstAirline);
        
var a = await config.flightSuretyData.getRegisteringAirlineAdresses(accounts[5]);
console.log(a);
console.log("[ '" + config.firstAirline + "' ]");

try {
    await config.flightSuretyData.unregisterAirline(accounts[5], { from: config.firstAirline });
} catch(e) {
    // noop
}

var a = await config.flightSuretyData.getRegisteringAirlineAdresses(accounts[5]);
console.log(a);
console.log("[ '" + config.firstAirline + "' ]");

        for (var i = 2; i < 20; i++) {
            try {
                console.log("unregister " + i);
                await config.flightSuretyData.unregisterAirline(accounts[i], { from: config.firstAirline });
            } catch(e) {
                // noop
            }
        }

var a = await config.flightSuretyData.getRegisteringAirlineAdresses(accounts[5]);
console.log(a);
console.log("[ '" + config.firstAirline + "' ]");

        let numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 1, "there should be exactly one registered airline (the \"firstAirline\"");

console.log("register 2");
        await config.flightSuretyData.registerAirline(accounts[2], {from: config.firstAirline});
        let registered = await config.flightSuretyData.isAirlineRegistered(accounts[2]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 2, "there should be exactly two registered airlines");

        await config.flightSuretyData.authorizeCaller(accounts[2]);
        try {
            await config.flightSuretyData.defund({ from: accounts[2] });
        } catch(e) {
            // noop
        }
        await config.flightSuretyData.fund({ from: accounts[2], value: web3.toWei('10', 'ether') });

console.log("register 3");
        await config.flightSuretyData.registerAirline(accounts[3], {from: config.firstAirline});
        registered = await config.flightSuretyData.isAirlineRegistered(accounts[3]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 3, "there should be exactly three registered airlines");

console.log("register 4");
        await config.flightSuretyData.registerAirline(accounts[4], {from: config.firstAirline});
        registered = await config.flightSuretyData.isAirlineRegistered(accounts[4]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 4, "there should be exactly four registered airlines");

console.log("register 5");
registered = await config.flightSuretyData.isAirlineRegistered(accounts[5]);
assert.equal(registered, false, "Airline is registered, but it should not be");
console.log("    account[5] already registered: " + registered);
console.log("    registering account[5] now ...");
        await config.flightSuretyData.registerAirline(accounts[5], {from: config.firstAirline});
console.log("    account[5] registered by firstAirline");
console.log("register 5a");
        registered = await config.flightSuretyData.isAirlineRegistered(accounts[5]);
        assert.equal(registered, false, "Airline is registered, but it should not be");
console.log("register 5b");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 4, "there should still be exactly four registered airlines");
        await config.flightSuretyData.registerAirline(accounts[5], {from: accounts[2]});
console.log("register 5c");
        registered = await config.flightSuretyData.isAirlineRegistered(accounts[5]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await config.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 5, "there should be exactly five registered airlines");
    });

    // it('overfund airline', async function() {
    //     await config.flightSuretyData.setOperatingStatus(true);
    //     await config.flightSuretyData.authorizeCaller(config.firstAirline);

    //     const firstAirlineBalanceBefore = await web3.eth.getBalance(config.firstAirline);
    //     const dataBalanceBefore = await web3.eth.getBalance(config.flightSuretyData.address);

    //     await config.flightSuretyData.fund({ from: config.firstAirline, value: web3.toWei('12', 'ether') });

    //     const firstAirlineBalanceAfter = await web3.eth.getBalance(config.firstAirline);
    //     const dataBalanceAfter = await web3.eth.getBalance(config.flightSuretyData.address);
    //     const blockchainCost = 974464;

    //     assert.equal(dataBalanceBefore.add(web3.toWei('10', 'ether')).eq(dataBalanceAfter), true, 'data contract has not received the correct amount of money');
    //     assert.equal(firstAirlineBalanceAfter.add(web3.toWei('10', 'ether')).add(blockchainCost).eq(firstAirlineBalanceBefore), true, 'firstAirline has not paid the correct amount of money');
        
    //     await config.flightSuretyData.unauthorizeCaller(config.firstAirline);
    // });
    






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
