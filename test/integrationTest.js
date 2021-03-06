let BigNumber = require('bignumber.js');
let FlightSuretyApp = artifacts.require("FlightSuretyApp");
let FlightSuretyData = artifacts.require("FlightSuretyData");

const numberOfOracles = 20;

async function initOracles(accounts, flightSuretyApp) {
    let registeredOracles = [];
    let numberOfAccounts = accounts.length;
    console.log('there are %d accounts', numberOfAccounts);

    let registrationFee = await flightSuretyApp.REGISTRATION_FEE();
    console.log('registrationFee: ' + registrationFee);

    // register 20 oracles
    for (let i = numberOfAccounts - numberOfOracles; i < numberOfAccounts; i++) {
        console.log('registering oracle %d', i + numberOfOracles - numberOfAccounts + 1);
        await flightSuretyApp.registerOracle({ from: accounts[i], value: registrationFee, gas: 99999999, gasPrice: 1 });
        let oracle = await flightSuretyApp.getMyIndexes({ from: accounts[i] });
        oracle.push(accounts[i]);
        registeredOracles.push(oracle);
    }

    flightSuretyApp.OracleRequest(async function (error, event) {
        if (error) {
            console.log(error);
        } else {
            let index = event.args.index;
            let airline = event.args.airline;
            let flight = event.args.flight;
            let timestamp = event.args.timestamp;
        
            console.log('flight %s triggered a status update with index %s', flight, index);
            console.log('looking for oracles with index %s', index);
            for (let i = 0; i < numberOfOracles; i++) {
                if (parseInt(registeredOracles[i][0]) == parseInt(index) ||
                    parseInt(registeredOracles[i][1]) == parseInt(index) ||
                    parseInt(registeredOracles[i][2]) == parseInt(index)) {
                        console.log('found oracle: ' + i);
                        await flightSuretyApp.submitOracleResponse(index, airline, flight, timestamp, 20, { from: registeredOracles[i][3] });
                        console.log('oracle response was sent');
                    }
            }
        }
    });
}

contract('Integration Tests', async (accounts) => {
    web3.eth.defaultAccount = accounts[0];
    let owner = accounts[0];
    let firstAirline = accounts[1];

    let passenger1 = accounts[2];
    let passenger2 = accounts[3];
    let passenger3 = accounts[4];
    let passenger4 = accounts[5];

    beforeEach(async function() {
        this.flightSuretyData = await FlightSuretyData.new(firstAirline, { from: owner });
        this.flightSuretyApp = await FlightSuretyApp.new(this.flightSuretyData.address, { from: owner });
        await this.flightSuretyData.authorizeCaller(this.flightSuretyApp.address, { from: owner });
        await initOracles(accounts, this.flightSuretyApp);
    });

    it('creditInsurees', async function() {
        // register oracles
        // buy insurance for flight A for 1 and 2
        // buy insurance for flight B for 2 and 3
        // fetchFlightStatus such that oracles respond
        // verify 1 and 2 have 1.5x their investment as balance

        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(owner);

        let flightA = 'testflight_A';
        let flightB = 'testflight_B';

        let insurancefee1 = web3.utils.toWei('0.1', 'ether');
        let insurancefee2 = web3.utils.toWei('0.2', 'ether');
        let insurancefee3 = web3.utils.toWei('0.4', 'ether');
        let insurancefee4 = web3.utils.toWei('0.8', 'ether');

        let buyInsuranceBlockchainCost = new BigNumber('151882');
        let blockchainBalanceBeforePassenger1 = new BigNumber(await web3.eth.getBalance(passenger1));

        await this.flightSuretyApp.buyInsurance(flightA, { from: passenger1, value: insurancefee1 });
        await this.flightSuretyApp.buyInsurance(flightA, { from: passenger2, value: insurancefee2 });
        await this.flightSuretyApp.buyInsurance(flightB, { from: passenger3, value: insurancefee3 });
        await this.flightSuretyApp.buyInsurance(flightB, { from: passenger4, value: insurancefee4 });

        await this.flightSuretyApp.fetchFlightStatus(firstAirline, flightA, 0);
        await sleep(2000); // wait for oracle messages to propagate through the net

        let balance1After = new BigNumber(await this.flightSuretyData.myBalance({ from: passenger1 }));
        let balance2After = new BigNumber(await this.flightSuretyData.myBalance({ from: passenger2 }));
        let balance3After = new BigNumber(await this.flightSuretyData.myBalance({ from: passenger3 }));
        let balance4After = new BigNumber(await this.flightSuretyData.myBalance({ from: passenger4 }));
        
        let expectedBalance1 = web3.utils.toWei('0.15', 'ether');
        let expectedBalance2 = web3.utils.toWei('0.3', 'ether');
        let expectedBalance3 = web3.utils.toWei('0', 'ether');
        let expectedBalance4 = web3.utils.toWei('0', 'ether');

        assert.equal(balance1After, expectedBalance1, 'passenger 1 balance not correct');
        assert.equal(balance2After, expectedBalance2, 'passenger 2 balance not correct');
        assert.equal(balance3After, expectedBalance3, 'passenger 3 balance not correct');
        assert.equal(balance4After, expectedBalance4, 'passenger 4 balance not correct');

        let blockchainBalanceAfterPassenger1BeforeWithdrawal = new BigNumber(await web3.eth.getBalance(passenger1));

        assert.equal(blockchainBalanceBeforePassenger1.eq(blockchainBalanceAfterPassenger1BeforeWithdrawal.plus(buyInsuranceBlockchainCost).plus(insurancefee1)), true, 'passenger 1 blockchain balance not correct before withdrawal');

        await this.flightSuretyData.withdraw({ from: passenger1 });

        let withdrawBlockchainCost = new BigNumber('19754');
        let blockchainBalanceAfterPassenger1 = new BigNumber(await web3.eth.getBalance(passenger1));

        assert.equal(blockchainBalanceBeforePassenger1.plus(web3.utils.toWei('0.05', 'ether')).eq(blockchainBalanceAfterPassenger1.plus(buyInsuranceBlockchainCost).plus(withdrawBlockchainCost)), true, 'passenger 1 blockchain balance not correct after withdrawal');
    });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}  
  