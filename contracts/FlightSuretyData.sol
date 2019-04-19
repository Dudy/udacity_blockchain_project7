pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {

    using SafeMath for uint256;

    uint constant JOIN_FEE = 10 ether;
    uint constant CONSENSUS_THRESHOLD = 4;

    struct Airline {
        bool isRegistered;
        bool hasPaidFund;
        mapping(address => uint) registeringAirlines;
        uint numberOfRegisteringAirlines;
    }

    address private contractOwner;
    bool private operational = true;
    mapping(address => uint) private authorizedContracts;
    mapping(address => Airline) private airlines;
    uint numberOfRegisteredAirlines = 0;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    struct Insurance {
        bool isRegistered;
        bool isPaidOut;
        uint fee;
    }
    mapping(bytes32 => Insurance) insurances;

    constructor(address firstAirline) public {
        contractOwner = msg.sender;
        emit Log("Data: constructor: contractOwner set");
        Airline memory airline;
        airline.isRegistered = true;
        airline.hasPaidFund = false;
        airline.numberOfRegisteringAirlines = 0;
        airlines[firstAirline] = airline;
        numberOfRegisteredAirlines = 1;
    }

    event Log(string text);

// region modifier
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;
    }

    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAuthorizedCaller() {
        require(isCallerAuthorized(msg.sender), "Caller not authorized");
        _;
    }
// endregion

// region utilities
    function isOperational() public view returns(bool) {
        return operational;
    }

    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function isCallerAuthorized(address caller) public view returns(bool) {
        return authorizedContracts[caller] == 1;
    }

    function authorizeCaller(address caller) external requireContractOwner {
        authorizedContracts[caller] = 1;
    }

    function unauthorizeCaller(address caller) external requireContractOwner {
        delete authorizedContracts[caller];
    }

    function isAirlineRegistered(address airline) external view returns(bool) {
        return airlines[airline].isRegistered;
    }

    function hasAirlinePaidFund(address airline) external view returns(bool) {
        return airlines[airline].hasPaidFund;
    }

    function getNumberOfRegisteredAirlines() external view returns(uint) {
        return numberOfRegisteredAirlines;
    }

    function getInsuranceKey(address passenger, string flightnumber) pure internal returns(bytes32) {
        return keccak256(abi.encodePacked(passenger, flightnumber));
    }
// endregion

// region business logic
    function registerAirline(address newAirline) external requireIsOperational requireAuthorizedCaller {
        require(airlines[msg.sender].isRegistered, "Caller is not a registered airline");
        require(airlines[msg.sender].hasPaidFund, "Calling airline has not yet paid their funds");
        require(!airlines[newAirline].isRegistered, "Airline already registered");

        if (numberOfRegisteredAirlines >= CONSENSUS_THRESHOLD) {
            require(airlines[newAirline].registeringAirlines[msg.sender] == 0, "cannot vote for registration of the same airline twice");

            airlines[newAirline].registeringAirlines[msg.sender] = 1;
            airlines[newAirline].numberOfRegisteringAirlines = airlines[newAirline].numberOfRegisteringAirlines.add(1);

            if (airlines[newAirline].numberOfRegisteringAirlines * 2 >= numberOfRegisteredAirlines) {
                airlines[newAirline].isRegistered = true;
                numberOfRegisteredAirlines = numberOfRegisteredAirlines.add(1);
            }
        } else {
            airlines[newAirline].isRegistered = true;
            airlines[newAirline].registeringAirlines[msg.sender] = 1;
            airlines[newAirline].numberOfRegisteringAirlines = 1;
            numberOfRegisteredAirlines = numberOfRegisteredAirlines.add(1);
        }
    }

    function unregisterAirline(address airline) external requireIsOperational requireAuthorizedCaller {
        require(airlines[airline].isRegistered, "airline is not registered");
        delete airlines[airline];
        numberOfRegisteredAirlines = numberOfRegisteredAirlines.sub(1);
    }



    event InsuranceBoughtEvent(address passenger, string flightnumber, uint fee);
    function buyInsurance(address passenger, string flightnumber, uint insurancefee) external requireIsOperational requireAuthorizedCaller {
        require(insurancefee <= 1 ether, "insurances can only be up to 1 ether");

        bytes32 insuranceKey = getInsuranceKey(passenger, flightnumber);

        require(!insurances[insuranceKey].isRegistered, "you can only buy one insurance per flight per passenger");
        require(!insurances[insuranceKey].isPaidOut, "this insurance has already been paid out");

        insurances[insuranceKey] = Insurance(true, false, insurancefee);
        emit InsuranceBoughtEvent(passenger, flightnumber, insurancefee);
    }

    function test(string text) external {
        emit Log(text);
    }





    function creditInsurees(address passenger, string flightnumber) external requireIsOperational requireAuthorizedCaller {
        // there will be an internal account on which user payments will be tracked
        // there will be no payout here! see next method

        bytes32 insuranceKey = getInsuranceKey(passenger, flightnumber);
        // TODO: transfer insurances[insuranceKey].fee to passengers account for later withdrawel;
    }
    
//     function pay() external requireIsOperatioal {
//         // this method will transfer funds to the user, but noch in a push manner but in a pull manner
//         // users need to call this to get their funds payed out
//     }

    function airlineFunding() public payable requireIsOperational requireAuthorizedCaller {
        require(msg.value >= JOIN_FEE, "value is too low, price not met");
        require(airlines[msg.sender].isRegistered, "Caller is not a registered airline");
        require(!airlines[msg.sender].hasPaidFund, "Calling airline has already paid their funds");

        //emit Log("unknown method, fallthrough get's to work");

        airlines[msg.sender].hasPaidFund = true;

        uint amountToReturn = msg.value - JOIN_FEE;
        msg.sender.transfer(amountToReturn);
    }

//     function getFlightKey(address airline, string memory flight, uint256 timestamp) internal returns(bytes32) {
//         return keccak256(abi.encodePacked(airline, flight, timestamp));
//     }

    function fund() public payable {
    }

    function() external payable {
        //emit Log("Data: unknown");
        //emit Log("unknown method, fallthrough get's to work");
        fund();
    }
// endregion
}

