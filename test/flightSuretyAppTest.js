var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");

contract('Flight Surety App Tests', async (accounts) => {
    let owner = accounts[0];
    let firstAirline = accounts[1];
    let someone = accounts[2];

    beforeEach(async function() { 
        this.flightSuretyData = await FlightSuretyData.new(firstAirline, { from: owner });
        this.flightSuretyApp = await FlightSuretyApp.new(this.flightSuretyData.address, { from: owner });
        await this.flightSuretyData.authorizeCaller(this.flightSuretyApp.address, { from: owner });
    });

    it('buy an insurances for too much money', async function() {
        let flightnumber = 'testflight_0';
        let insurancefee = web3.utils.toWei('1.3', 'ether');

        try {
            let response = await this.flightSuretyApp.buyInsurance(flightnumber, { from: someone, value: insurancefee });
        } catch(e) {
            assert.equal(e.reason, "insurances can only be up to 1 ether", "wrong exception occurred");
        }

        let numberOfInsurances = await this.flightSuretyApp.getNumberOfInsurances();
        assert.equal(numberOfInsurances, 0, 'insurance has been bought although it should not have been possible');
    });

    it('buy two insurances for the same flight', async function() {
        let flightnumber = 'testflight_0';
        let insurancefee = web3.utils.toWei('0.3', 'ether');

        await this.flightSuretyApp.buyInsurance(flightnumber, { from: someone, value: insurancefee });

        let numberOfInsurances = await this.flightSuretyApp.getNumberOfInsurances();
        assert.equal(numberOfInsurances, 1, 'could not buy an insurance');

        try {
            await this.flightSuretyApp.buyInsurance(flightnumber, { from: someone, value: insurancefee });
        } catch(e) {
            assert.equal(e.reason, "you can only buy one insurance per flight per passenger", "wrong exception occurred");
        }

        numberOfInsurances = await this.flightSuretyApp.getNumberOfInsurances();
        assert.equal(numberOfInsurances, 1, 'two insurances have been bought although only one should have been possible');
    });

    it('buy an insurances', async function() {
        let flightnumber = 'testflight_0';
        let insurancefee = web3.utils.toWei('0.4', 'ether');

        await this.flightSuretyApp.buyInsurance(flightnumber, { from: someone, value: insurancefee });

        let numberOfInsurances = await this.flightSuretyApp.getNumberOfInsurances();
        assert.equal(numberOfInsurances, 1, 'insurance could not be bought');
    });

    it('call fetchFlightStatus', async function() {
        let flightnumber = 'testflight_0';
        let result = await this.flightSuretyApp.fetchFlightStatus(firstAirline, flightnumber, Math.floor(Date.now() / 1000));
        assert.equal(result.logs[0].event, 'OracleRequest', 'no OracleRequest event was sent');
        assert.equal(result.logs[0].args.airline, firstAirline, 'wrong airline in OracleRequest event');
        assert.equal(result.logs[0].args.flight, flightnumber, 'wrong flightnumber in OracleRequest event');
    });

});
