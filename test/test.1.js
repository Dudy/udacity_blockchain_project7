var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");

contract('TEST TEST', async (accounts) => {
    let owner = accounts[0];
    let firstAirline = accounts[1];

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

        const allFlightSuretyDataEvents = this.flightSuretyData.allEvents({
            fromBlock: 0,
            toBlock: 'latest'
        });
        
        allFlightSuretyDataEvents.watch((err, res) => {
            // console.log(err, res);
            // console.log();
        });

// console.log(this.flightSuretyData);
console.log('------------------------------------------------------------------------------------------');

        this.flightSuretyApp = await FlightSuretyApp.new(this.flightSuretyData.address, { from: owner });

// // console.log(this.flightSuretyApp);

        await this.flightSuretyData.authorizeCaller(this.flightSuretyApp.address, { from: owner });


        const allFlightSuretyAppEvents = this.flightSuretyApp.allEvents({
            fromBlock: 0,
            toBlock: 'latest'
        });

        allFlightSuretyAppEvents.watch((err, res) => {
            // console.log(err, res);
            // console.log();
        });
    });

    it('buy an insurances for too much money', async function() {
        let flightnumber = 'testflight_0';
        let insurancefee = web3.toWei(1.3, 'ether');

        try {
            let response = await this.flightSuretyApp.buyInsurance(flightnumber, { from: testAddresses[0], value: insurancefee });
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert insurances can only be up to 1 ether", "wrong exception occurred");
        }

        let numberOfInsurances = await this.flightSuretyApp.getNumberOfInsurances();
        assert.equal(numberOfInsurances, 0, 'insurance has been bought although it should not have been possible');
    });

    it('buy two insurances for the same flight', async function() {
        let flightnumber = 'testflight_0';
        let insurancefee = web3.toWei(0.3, 'ether');

        await this.flightSuretyApp.buyInsurance(flightnumber, { from: testAddresses[0], value: insurancefee });

        let numberOfInsurances = await this.flightSuretyApp.getNumberOfInsurances();
        assert.equal(numberOfInsurances, 1, 'could not buy an insurance');

        try {
            await this.flightSuretyApp.buyInsurance(flightnumber, { from: testAddresses[0], value: insurancefee });
        } catch(e) {
            assert.equal(e.message, "VM Exception while processing transaction: revert you can only buy one insurance per flight per passenger", "wrong exception occurred");
        }

        numberOfInsurances = await this.flightSuretyApp.getNumberOfInsurances();
        assert.equal(numberOfInsurances, 1, 'two insurances have been bought although only one should have been possible');
    });

    it('buy an insurances', async function() {
        let flightnumber = 'testflight_0';
        let insurancefee = web3.toWei(0.4, 'ether');

        await this.flightSuretyApp.buyInsurance(flightnumber, { from: testAddresses[0], value: insurancefee });

        let numberOfInsurances = await this.flightSuretyApp.getNumberOfInsurances();
        assert.equal(numberOfInsurances, 1, 'insurance could not be bought');
    });

});


