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
        if (error) console.log(error);

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
    });
}

contract('Flight Surety Tests', async (accounts) => {
    web3.eth.defaultAccount = accounts[0];
    let owner = accounts[0];
    let firstAirline = accounts[1];
    const JOIN_FEE =  web3.toWei(10,"ether");
    let testAddresses = [
        "0x69e1cb5cfca8a311586e3406ed0301c06fb839a2",
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
        await initOracles(accounts, this.flightSuretyApp);
    });

    it('creditInsurees', async function() {
        // register oracles
        // create four passengers (1, 2, 3, 4)
        // buy insurance for flight A for 1 and 2
        // buy insurance for flight B for 2 and 3
        // fetchFlightStatus such that oracles respond
        // verify 1 and 2 have 1.5x their investment as balance

        await this.flightSuretyData.setOperatingStatus(true);
        await this.flightSuretyData.authorizeCaller(owner);

        let passenger1 = testAddresses[1];
        let passenger2 = testAddresses[2];
        let passenger3 = testAddresses[3];
        let passenger4 = testAddresses[4];

        let flightA = 'testflight_A';
        let flightB = 'testflight_B';

        let insurancefee1 = web3.toWei(0.1, 'ether');
        let insurancefee2 = web3.toWei(0.2, 'ether');
        let insurancefee3 = web3.toWei(0.4, 'ether');
        let insurancefee4 = web3.toWei(0.8, 'ether');

        let buyInsuranceBlockchainCost = 4860928;
        let blockchainBalanceBeforePassenger1 = await web3.eth.getBalance(passenger1);

        await this.flightSuretyApp.buyInsurance(flightA, { from: passenger1, value: insurancefee1 });
        await this.flightSuretyApp.buyInsurance(flightA, { from: passenger2, value: insurancefee2 });
        await this.flightSuretyApp.buyInsurance(flightB, { from: passenger3, value: insurancefee3 });
        await this.flightSuretyApp.buyInsurance(flightB, { from: passenger4, value: insurancefee4 });

        await this.flightSuretyApp.fetchFlightStatus(firstAirline, flightA, 0);
        await sleep(2000); // wait for oracle messages to propagate through the net

        let balance1After = await this.flightSuretyData.myBalance({ from: passenger1 });
        let balance2After = await this.flightSuretyData.myBalance({ from: passenger2 });
        let balance3After = await this.flightSuretyData.myBalance({ from: passenger3 });
        let balance4After = await this.flightSuretyData.myBalance({ from: passenger4 });
        
        let expectedBalance1 = web3.toWei(0.15, 'ether');
        let expectedBalance2 = web3.toWei(0.3, 'ether');
        let expectedBalance3 = web3.toWei(0, 'ether');
        let expectedBalance4 = web3.toWei(0, 'ether');

        assert.equal(balance1After, expectedBalance1, 'passenger 1 balance not correct');
        assert.equal(balance2After, expectedBalance2, 'passenger 2 balance not correct');
        assert.equal(balance3After, expectedBalance3, 'passenger 3 balance not correct');
        assert.equal(balance4After, expectedBalance4, 'passenger 4 balance not correct');

        let blockchainBalanceAfterPassenger1BeforeWithdrawal = await web3.eth.getBalance(passenger1); // 100 ETH - blockchainCost gas (4860928 wei) - insurance (0.1 ETH) + refund (0.15 ETH) => 
        assert.equal(blockchainBalanceBeforePassenger1.toString(), blockchainBalanceAfterPassenger1BeforeWithdrawal.add(buyInsuranceBlockchainCost).add(insurancefee1).toString(), 'passenger 1 blockchain balance not correct before withdrawal');

        await this.flightSuretyData.withdraw({ from: passenger1 });

        let withdrawBlockchainCost = 632128;
        let blockchainBalanceAfterPassenger1 = await web3.eth.getBalance(passenger1); // 100 ETH - blockchainCost gas (4860928 wei) - insurance (0.1 ETH) + refund (0.15 ETH) => 
        assert.equal(blockchainBalanceBeforePassenger1.add(web3.toWei(0.05, 'ether').toString()), blockchainBalanceAfterPassenger1.add(buyInsuranceBlockchainCost).add(withdrawBlockchainCost).toString(), 'passenger 1 blockchain balance not correct after withdrawal');
    });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}  
  