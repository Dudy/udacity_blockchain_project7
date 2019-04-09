pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {

    using SafeMath for uint256;

    uint constant JOIN_FEE = 10 ether;

    struct Airline {
        bool isRegistered;
        bool hasPaidFund;
    }

    address private contractOwner;
    bool private operational = true;
    mapping(address => uint256) private authorizedContracts;
    mapping(address => Airline) private airlines;

    constructor(address firstAirline) public {
        contractOwner = msg.sender;
        airlines[firstAirline] = Airline(true, false);
    }

    // modifier

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

    // utilities

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

    // business logic

    function registerAirline(address newAirline) external requireIsOperational requireAuthorizedCaller {
        require(airlines[msg.sender].isRegistered, "Caller is not a registered airline");
        require(airlines[msg.sender].hasPaidFund, "Calling airline has not yet paid their funds");
        require(!airlines[newAirline].isRegistered, "Airline already registered");
        airlines[newAirline] = Airline(true, false);
    }

//     function buy() external payable requireIsOperational {
//     }

//     function creditInsurees() external requireIsOperational {
//         // there will be an internal account on which user payments will be tracked
//         // there will be no payout here! see next method
//     }
    
//     function pay() external requireIsOperatioal {
//         // this method will transfer funds to the user, but noch in a push manner but in a pull manner
//         // users need to call this to get their funds payed out
//     }

    function fund() public payable requireIsOperational requireAuthorizedCaller {
        require(msg.value >= JOIN_FEE, "value is too low, price not met");
        require(airlines[msg.sender].isRegistered, "Caller is not a registered airline");
        require(!airlines[msg.sender].hasPaidFund, "Calling airline has already paid their funds");

        uint amountToReturn = msg.value - JOIN_FEE;
        msg.sender.transfer(amountToReturn);
    }

//     function getFlightKey(address airline, string memory flight, uint256 timestamp) internal returns(bytes32) {
//         return keccak256(abi.encodePacked(airline, flight, timestamp));
//     }

//     /**
//     * @dev Fallback function for funding smart contract.
//     */
//     function() external payable {
//         fund();
//     }
}

