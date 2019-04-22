var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {
    let owner = accounts[0];
    let firstAirline = accounts[1];
    let testAddresses = [
        "0x69e1CB5cFcA8A311586e3406ed0301C06fb839a2",
        "0xf014343bdffbed8660a9d8721dec985126f189f3",
        "0x0e79edbd6a727cfee09a2b1d0a59f7752d5bf7c9",
        "0x9bc1169ca09555bf2721a5c9ec6d69c8073bfeb4",
        "0xa23eaef02f9e0338eecda8fdd0a73add781b2a86",
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
            assert.equal(e.reason, "Caller is not contract owner", "wrong exception occurred");
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
            assert.equal(e.reason, "Caller is not contract owner", "wrong exception occurred");
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
            assert.equal(e.reason, "Contract is currently not operational", "wrong exception occurred");
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        await this.flightSuretyData.setOperatingStatus(true);
    });

    it('when the caller is not authorized then it should not be possible to register a new airline', async function() {
        let reverted = false;
        try {
            await this.flightSuretyData.registerAirline(accounts[2], {from: firstAirline});
        } catch(e) {
            assert.equal(e.reason, "Caller not authorized", "wrong exception occurred");
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
            assert.equal(e.reason, "Caller is not a registered airline", "wrong exception occurred");
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
            assert.equal(e.reason, "Calling airline has not yet paid their funds", "wrong exception occurred");
            registrationSuccessful = false;
        }
        assert.equal(registrationSuccessful, false, "Caller has not paid funds, but call succeeded");

        await this.flightSuretyData.unauthorizeCaller(firstAirline);
    });

    it('registration of a new airline when there one, two, three, four or five already registered airlines', async function() {
        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(firstAirline);
        await this.flightSuretyData.airlineFunding({ from: firstAirline, value: web3.utils.toWei('10', 'ether') });

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
        await this.flightSuretyData.airlineFunding({ from: firstAirline, value: web3.utils.toWei('10', 'ether') });
        let numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 1, "there should be exactly one registered airline (the \"firstAirline\"");

        // register and fund second airline
        await this.flightSuretyData.registerAirline(accounts[2], {from: firstAirline});
        let registered = await this.flightSuretyData.isAirlineRegistered(accounts[2]);
        assert.equal(registered, true, "Airline is not registered, but it should be");
        numberOfRegisteredAirlines = await this.flightSuretyData.getNumberOfRegisteredAirlines()
        assert.equal(numberOfRegisteredAirlines, 2, "there should be exactly two registered airlines");
        await this.flightSuretyData.authorizeCaller(accounts[2]);
        await this.flightSuretyData.airlineFunding({ from: accounts[2], value: web3.utils.toWei('10', 'ether') });

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

        const firstAirlineBalanceBefore = new BigNumber(await web3.eth.getBalance(firstAirline));
        const dataBalanceBefore = new BigNumber(await web3.eth.getBalance(this.flightSuretyData.address));

        await this.flightSuretyData.airlineFunding({ from: firstAirline, value: web3.utils.toWei('12', 'ether') });

        const firstAirlineBalanceAfter = new BigNumber(await web3.eth.getBalance(firstAirline));
        const dataBalanceAfter = new BigNumber(await web3.eth.getBalance(this.flightSuretyData.address));
        const blockchainCost = 720800000000000;

        assert.equal(dataBalanceBefore.plus(web3.utils.toWei('10', 'ether')).eq(dataBalanceAfter), true, 'data contract has not received the correct amount of money');
        assert.equal(firstAirlineBalanceAfter.plus(web3.utils.toWei('10', 'ether')).plus(blockchainCost).eq(firstAirlineBalanceBefore), true, 'firstAirline has not paid the correct amount of money');
        
        await this.flightSuretyData.unauthorizeCaller(firstAirline);
    });

    it('call buyInsurance', async function() {
        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(firstAirline);
        await this.flightSuretyData.airlineFunding({ from: firstAirline, value: web3.utils.toWei('12', 'ether') });

        let flightnumber = 'testflight_0';
        let insurancefee = web3.utils.toWei('0.3', 'ether');
        let result = await this.flightSuretyData.buyInsurance(testAddresses[0], flightnumber, insurancefee, { from: firstAirline });

        assert.equal(result.logs[0].event, 'InsuranceBoughtEvent', 'no InsuranceBoughtEvent event was sent');
        assert.equal(result.logs[0].args.passenger, testAddresses[0], 'wrong passenger in InsuranceBoughtEvent event');
        assert.equal(result.logs[0].args.flightnumber, flightnumber, 'wrong flightnumber in InsuranceBoughtEvent event');
    });

    it('creditInsurees', async function() {
        // create four passengers (1, 2, 3, 4)
        // buy insurance for flight A for 1 and 2
        // buy insurance for flight B for 2 and 3
        // call 'creditInsurees' for flightA
        // verify 1 and 2 have 1.5x their investment as balance

        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(owner);

        let passenger1 = testAddresses[1];
        let passenger2 = testAddresses[2];
        let passenger3 = testAddresses[3];
        let passenger4 = testAddresses[4];

        let flightA = 'testflight_A';
        let flightB = 'testflight_B';

        let insurancefee1 = web3.utils.toWei('0.1', 'ether');
        let insurancefee2 = web3.utils.toWei('0.2', 'ether');
        let insurancefee3 = web3.utils.toWei('0.4', 'ether');
        let insurancefee4 = web3.utils.toWei('0.8', 'ether');

        await this.flightSuretyData.buyInsurance(passenger1, flightA, insurancefee1);
        await this.flightSuretyData.buyInsurance(passenger2, flightA, insurancefee2);
        await this.flightSuretyData.buyInsurance(passenger2, flightB, insurancefee3);
        await this.flightSuretyData.buyInsurance(passenger3, flightB, insurancefee4);

        await this.flightSuretyData.creditInsurees(flightA);

        let balance1After = await this.flightSuretyData.myBalance({ from: passenger1 });
        let balance2After = await this.flightSuretyData.myBalance({ from: passenger2 });
        let balance3After = await this.flightSuretyData.myBalance({ from: passenger3 });
        let balance4After = await this.flightSuretyData.myBalance({ from: passenger4 });
        
        let expectedBalance1 = web3.utils.toWei('0.15', 'ether');
        let expectedBalance2 = web3.utils.toWei('0.3', 'ether');
        let expectedBalance3 = web3.utils.toWei('0', 'ether');
        let expectedBalance4 = web3.utils.toWei('0', 'ether');

        assert.equal(balance1After, expectedBalance1, 'passenger 1 balance not correct');
        assert.equal(balance2After, expectedBalance2, 'passenger 2 balance not correct');
        assert.equal(balance3After, expectedBalance3, 'passenger 3 balance not correct');
        assert.equal(balance4After, expectedBalance4, 'passenger 4 balance not correct');
    });

    it('withdraw', async function() {
        // create a passenger
        // buy two insurance (0.1 ether, 0.2 ether)
        // call 'creditInsurees'
        // withdraw money

        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(owner);

        let passenger1 = testAddresses[1];
        let passenger2 = testAddresses[2];
        let passenger3 = testAddresses[3];
        let passenger4 = testAddresses[4];

        let flightA = 'testflight_A';
        let flightB = 'testflight_B';

        let insurancefee1 = web3.utils.toWei('0.1', 'ether');
        let insurancefee2 = web3.utils.toWei('0.2', 'ether');
        let insurancefee3 = web3.utils.toWei('0.4', 'ether');
        let insurancefee4 = web3.utils.toWei('0.8', 'ether');

        await this.flightSuretyData.buyInsurance(passenger1, flightA, insurancefee1);
        await this.flightSuretyData.buyInsurance(passenger2, flightA, insurancefee2);
        await this.flightSuretyData.buyInsurance(passenger2, flightB, insurancefee3);
        await this.flightSuretyData.buyInsurance(passenger3, flightB, insurancefee4);

        await this.flightSuretyData.creditInsurees(flightA);

        let balance1After = await this.flightSuretyData.myBalance({ from: passenger1 });
        let balance2After = await this.flightSuretyData.myBalance({ from: passenger2 });
        let balance3After = await this.flightSuretyData.myBalance({ from: passenger3 });
        let balance4After = await this.flightSuretyData.myBalance({ from: passenger4 });
        
        let expectedBalance1 = web3.utils.toWei('0.15', 'ether');
        let expectedBalance2 = web3.utils.toWei('0.3', 'ether');
        let expectedBalance3 = web3.utils.toWei('0', 'ether');
        let expectedBalance4 = web3.utils.toWei('0', 'ether');

        assert.equal(balance1After, expectedBalance1, 'passenger 1 balance not correct');
        assert.equal(balance2After, expectedBalance2, 'passenger 2 balance not correct');
        assert.equal(balance3After, expectedBalance3, 'passenger 3 balance not correct');
        assert.equal(balance4After, expectedBalance4, 'passenger 4 balance not correct');
    });
});
