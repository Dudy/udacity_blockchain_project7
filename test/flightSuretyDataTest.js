var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {
    let owner = accounts[0];
    let firstAirline = accounts[1];
    const JOIN_FEE =  web3.toWei(10,"ether");
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

    beforeEach(async function() { 
        this.flightSuretyData = await FlightSuretyData.new(firstAirline, { from: owner });
        this.flightSuretyApp = await FlightSuretyApp.new(this.flightSuretyData.address, { from: owner });
        await this.flightSuretyData.authorizeCaller(this.flightSuretyApp.address, { from: owner });
    });

    // check operational status

    it('(multiparty) has correct initial isOperational() value', async function () {
        let status = await this.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it('(multiparty) can block access to setOperatingStatus() for non-Contract Owner account', async function () {
        let accessDenied = false;
        try {
            await this.flightSuretyData.setOperatingStatus(false, { from: testAddresses[2] });
        } catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
    });

    it('(multiparty) can allow access to setOperatingStatus() for Contract Owner account', async function () {
        let accessDenied = false;
        try {
            await this.flightSuretyData.setOperatingStatus(false, { from: owner });
        } catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it('(multiparty) can block access to functions using requireIsOperational when operating status is false', async function () {
        await this.flightSuretyData.setOperatingStatus(false);
    
        let reverted = false;
        try {
            await this.flightSuretyData.registerAirline(accounts[2], {from: firstAirline});
        } catch(e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

        await this.flightSuretyData.setOperatingStatus(true);
    });

    // authorization

    it('check that app contract is authorized on data contract', async function() {
        let status = await this.flightSuretyData.isCallerAuthorized.call(this.flightSuretyApp.address);
        assert.equal(status, true, "App contract is not authorized on data contract");
    });

    it('contract owner can authorize a caller', async function() {
        await this.flightSuretyData.authorizeCaller(testAddresses[2]);
        let status = await this.flightSuretyData.isCallerAuthorized.call(testAddresses[2]);
        assert.equal(status, true, "Authorization not successful");
    });

    it('contract non-owner cannot authorize a caller', async function() {
        let errorFree = true;
        try {
            await this.flightSuretyData.authorizeCaller(testAddresses[3], { from: testAddresses[4] });
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert Caller is not contract owner", "wrong exception occurred");
            errorFree = false;
        }
        assert.equal(errorFree, false, "Authorization attemp did not threw an expected error");

        let status = await this.flightSuretyData.isCallerAuthorized.call(testAddresses[3]);
        assert.equal(status, false, "Authorization unexpectedly successful");
    });

    it('contract owner can unauthorize a caller', async function() {
        await this.flightSuretyData.authorizeCaller(testAddresses[2]);
        let status = await this.flightSuretyData.isCallerAuthorized.call(testAddresses[2]);
        assert.equal(status, true, "Account is not authorized");

        let errorFree = true;
        try {
            await this.flightSuretyData.unauthorizeCaller(testAddresses[2]);
        } catch(e) {
            errorFree = false;
        }
        assert.equal(errorFree, true, "Unauthorization attemp threw an error");

        status = await this.flightSuretyData.isCallerAuthorized.call(testAddresses[2]);
        assert.equal(status, false, "Unauthorization not successful");
    });

    it('contract non-owner cannot unauthorize a caller', async function() {
        await this.flightSuretyData.authorizeCaller(testAddresses[2]);
        let status = await this.flightSuretyData.isCallerAuthorized.call(testAddresses[2]);
        assert.equal(status, true, "Account is not authorized");

        let errorFree = true;
        try {
            await this.flightSuretyData.unauthorizeCaller(testAddresses[2], { from: testAddresses[3] });
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert Caller is not contract owner", "wrong exception occurred");
            errorFree = false;
        }
        assert.equal(errorFree, false, "Unauthorization attemp did not threw an expected error");

        status = await this.flightSuretyData.isCallerAuthorized.call(testAddresses[2]);
        assert.equal(status, true, "Unauthorization unexpectedly successful");
    });

    // airline registration

    it('when the data contract is not operational then it should not be possible to register a new airline', async function() {
        await this.flightSuretyData.setOperatingStatus(false);
    
        let reverted = false;
        try {
            await this.flightSuretyData.registerAirline(accounts[2], {from: firstAirline});
        } catch(e) {
            reverted = true;
            assert.equal(e.message, "VM Exception while processing transaction: revert Contract is currently not operational", "wrong exception occurred");
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        await this.flightSuretyData.setOperatingStatus(true);
    });

    it('when the caller is not authorized then it should not be possible to register a new airline', async function() {
        let reverted = false;
        try {
            await this.flightSuretyData.registerAirline(accounts[2], {from: firstAirline});
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert Caller not authorized", "wrong exception occurred");
            reverted = true;
        }
        assert.equal(reverted, true, "Caller is not authorized, but call succeeded");
    });

    it('when the caller is not a registered airline then it should not be possible to register a new airline', async function() {
        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(accounts[2]);

        let registrationSuccessful = true;
        try {
            await this.flightSuretyData.registerAirline(accounts[3], {from: accounts[2]});
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert Caller is not a registered airline", "wrong exception occurred");
            registrationSuccessful = false;
        }
        assert.equal(registrationSuccessful, false, "Caller is not registered, but call succeeded");
    });

    it('when the calling airline has not yet paid it\'s funds then it should not be possible to register a new airline', async function() {
        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(firstAirline);

        let registrationSuccessful = true;
        try {
            await this.flightSuretyData.registerAirline(accounts[2], {from: firstAirline});
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert Calling airline has not yet paid their funds", "wrong exception occurred");
            registrationSuccessful = false;
        }
        assert.equal(registrationSuccessful, false, "Caller has not paid funds, but call succeeded");

        await this.flightSuretyData.unauthorizeCaller(firstAirline);
    });

    it('registration of a new airline when there one, two, three, four or five already registered airlines', async function() {
        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(firstAirline);
        await this.flightSuretyData.fund({ from: firstAirline, value: web3.toWei('10', 'ether') });

        let numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 1, "there should be exactly one registered airline (the \"firstAirline\"");

        await this.flightSuretyData.registerAirline(accounts[2], {from: firstAirline});
        let registered = await this.flightSuretyData.isAirlineRegistered(accounts[2]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 2, "there should be exactly two registered airlines");

        await this.flightSuretyData.registerAirline(accounts[3], {from: firstAirline});
        registered = await this.flightSuretyData.isAirlineRegistered(accounts[3]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 3, "there should be exactly three registered airlines");

        await this.flightSuretyData.registerAirline(accounts[4], {from: firstAirline});
        registered = await this.flightSuretyData.isAirlineRegistered(accounts[4]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 4, "there should be exactly four registered airlines");

        await this.flightSuretyData.registerAirline(accounts[5], {from: firstAirline});
        registered = await this.flightSuretyData.isAirlineRegistered(accounts[5]);
        assert.equal(registered, false, "Airline is registered, but it should not be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 4, "there should still be exactly four registered airlines");
    });

    it('registration of a new fifth airline by two other', async function() {
        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(firstAirline);

        // fund first airline (it's already registered)
        await this.flightSuretyData.fund({ from: firstAirline, value: web3.toWei('10', 'ether') });
        let numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 1, "there should be exactly one registered airline (the \"firstAirline\"");

        // register and fund second airline
        await this.flightSuretyData.registerAirline(accounts[2], {from: firstAirline});
        let registered = await this.flightSuretyData.isAirlineRegistered(accounts[2]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 2, "there should be exactly two registered airlines");
        await this.flightSuretyData.authorizeCaller(accounts[2]);
        await this.flightSuretyData.fund({ from: accounts[2], value: web3.toWei('10', 'ether') });

        // register third airline
        await this.flightSuretyData.registerAirline(accounts[3], {from: firstAirline});
        registered = await this.flightSuretyData.isAirlineRegistered(accounts[3]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 3, "there should be exactly three registered airlines");

        // register fourth airline
        await this.flightSuretyData.registerAirline(accounts[4], {from: firstAirline});
        registered = await this.flightSuretyData.isAirlineRegistered(accounts[4]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 4, "there should be exactly four registered airlines");

        // register fifth airline, now with 50% consensus (= 2 other airlines)
        await this.flightSuretyData.registerAirline(accounts[5], {from: firstAirline});
        registered = await this.flightSuretyData.isAirlineRegistered(accounts[5]);
        assert.equal(registered, false, "Airline is registered, but it should not be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 4, "there should still be exactly four registered airlines");
        await this.flightSuretyData.registerAirline(accounts[5], {from: accounts[2]});
        registered = await this.flightSuretyData.isAirlineRegistered(accounts[5]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 5, "there should be exactly five registered airlines");
    });

    it('overfund airline', async function() {
        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(firstAirline);

        const firstAirlineBalanceBefore = await web3.eth.getBalance(firstAirline);
        const dataBalanceBefore = await web3.eth.getBalance(this.flightSuretyData.address);

        await this.flightSuretyData.fund({ from: firstAirline, value: web3.toWei('12', 'ether') });

        const firstAirlineBalanceAfter = await web3.eth.getBalance(firstAirline);
        const dataBalanceAfter = await web3.eth.getBalance(this.flightSuretyData.address);
        const blockchainCost = 1150464;

        assert.equal(dataBalanceBefore.add(web3.toWei('10', 'ether')).eq(dataBalanceAfter), true, 'data contract has not received the correct amount of money');
        assert.equal(firstAirlineBalanceAfter.add(web3.toWei('10', 'ether')).add(blockchainCost).eq(firstAirlineBalanceBefore), true, 'firstAirline has not paid the correct amount of money');
        
        await this.flightSuretyData.unauthorizeCaller(firstAirline);
    });

});