import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let registeredOracles = [];

const insuredStatus = 20;
const uninsuredStatus = [0, 10, 30, 40, 50];
const numberOfOracles = 20;

async function init() {
    let accounts = await web3.eth.getAccounts();
    let numberOfAccounts = accounts.length;
    web3.eth.defaultAccount = accounts[0];
    console.log('there are %d accounts', numberOfAccounts);

    let registrationFee = await flightSuretyApp.methods.REGISTRATION_FEE().call();
    console.log('registrationFee: ' + registrationFee);

    // register 20 oracles
    for (let i = numberOfAccounts - numberOfOracles; i < numberOfAccounts; i++) {
        console.log('registering oracle %d', i + numberOfOracles - numberOfAccounts + 1);
        await flightSuretyApp.methods.registerOracle().send({ from: accounts[i], value: registrationFee, gas: 10000000 });
        let oracle = await flightSuretyApp.methods.getMyIndexes().call({ from: accounts[i] });
        oracle.push(accounts[i]);

        console.log(oracle);
        registeredOracles.push(oracle);
    }

    // register event handler
    flightSuretyApp.events.OracleRequest({ fromBlock: 0 }, async function (error, event) {
        if (error) console.log(error);
        // console.log(event);
    
        let index = event.returnValues.index;
        let airline = event.returnValues.airline;
        let flight = event.returnValues.flight;
        let timestamp = event.returnValues.timestamp;
    
        console.log('flight %s triggered a status update with index %s', flight, event.returnValues.index);

        // half of all flights are secured, for better testability, the other half gets a random status
        let status;
        if (Math.random() > 0.5) {
            status = insuredStatus;
        } else {
            status = uninsuredStatus[Math.floor(Math.random() * uninsuredStatus.length)];
        }
        
        // find valid oracles and send their response
        for (let i = 0; i < numberOfOracles; i++) {
            if (registeredOracles[i][0] == index ||
                registeredOracles[i][1] == index ||
                registeredOracles[i][2] == index) {
                    console.log('found oracle:');
                    console.log(registeredOracles[i]);
                    await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, status).send({ from: registeredOracles[i][3] });
                    console.log('oracle response was sent');
                }
        }
    });
}

(async function() {
    await init();
})();
