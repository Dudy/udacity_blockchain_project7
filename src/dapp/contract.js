import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress, config.dataAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress, firstAirline);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts(async (error, accounts) => {
           
            this.owner = accounts[0];

            await this.flightSuretyData.methods.authorizeCaller(this.flightSuretyApp._address).send({ from: this.owner });

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accounts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accounts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    buyInsurance(flightnumber, insurancefee, callback) {
        let self = this;
        self.flightSuretyApp.methods
            .buyInsurance(flightnumber)
            .send({ from: self.owner, value: insurancefee, gas: 5000000}, (error, result) => {
                callback(error, result);
            });
    }
}