# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)

------------------------------------------------------------------------------------------

# Notes

The system is build of two contracts on the blockchain (a data contract and an application contract), a server-side backend
application (on oracle) and a client-side frontend (dapp).



# Requirements

## Modules
- one contract for data: FlightSuretyData => data persistence
- one contract for app logic: FlightSuretyApp => app logic, oracles code
- dapp client (Javascript in-browser client app) => UI to passengers
- server app => simulating oracles

## Airlines

- register first airline when the contract is deployed
    - airlines are stored in the data contract
    - app contract can call data.registerAirline()
- if there are less then five airlines registered, airline registration "data.registerAirline()" can only be called by existing airline
    - eg. modifier "callerIsRegisteredAirline"
- if there are at least four airlines, airline registration needs 50% multiparty-consensus
    - store airline registration proposals by proposing airline address
    - only if 50% of all already registered airlines have proposed to register a new airline, registration is really done
- when an airline is finally registered, it needs to provide 10 ETH funding to the data contract
    - the data contract holds all the data, so it also holds the fund

## Flights

- the dapp client should provide a form to submit flight data
- it's too complicated to connect to a real world airline API to get real data, and it's not necessary
- a flight consists of a unique flight number and a departure time (timestamp)

## Passengers

- may purchase flight insurance
    - payable, max. 1 ETH
- when a flight is delayed, the passenger receives 1.5x the amount they paid
- on payout, don't call "wallet.transfer()"
    - instead have a "user account" the gets the payout
    - and let the user withdraw from that account
        - mapping (address => uint) private userBalances;
          function withdrawBalance() public {
              uint amountToWithdraw = userBalances[msg.sender];
              userBalances[msg.sender] = 0;
              msg.sender.transfer(amountToWithdraw);
          }

## Oracles

- simulated as a server app
    - server.js
    - create some oracles (e.g. 20) and store them in memory
    - register them in the app
    - retrieve each oracles three indexes from the app
- client dapp triggers (button click) a request to update the flight status
    - app.fetchFlightStatus()
    - this emits an OracleRequest event
    - that button click simulates real world events (e.g. flight landing)
- server.js receives OracleRequest event
    - flightSuretyApp.events.OracleRequest()
    - loop through all oracles
    - find the ones that contain the given index in their list of three indexes
    - provide some answer to the app
        - submitOracleResponse()
        - randomly return one of the six STATUS_CODEs
        - maybe use some sanity here, such that of the 20 oracles, 15 are always sending the "correct" code and five a different one

## General

- state changing functions must have operational control
- multiparty consensus for state changing, just like when registering airlines
    - maybe there is some code reusability possibility here
- fail fast - use require at the beginning og the functions


