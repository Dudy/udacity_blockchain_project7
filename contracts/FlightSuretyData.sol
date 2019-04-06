pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {

    using SafeMath for uint256;

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

    modifier isCallerAuthorized() {
        require(authorizedContracts[msg.sender] == 1, "caller not authorized");
        _;
    }

    // utilities

    function isOperational() public view returns(bool) {
        return operational;
    }

    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function authorizeCaller(address caller) external requireContractOwner {
        authorizedContracts[caller] = 1;
    }

    function unauthorizeCaller(address caller) external requireContractOwner {
        delete authorizedContracts[caller];
    }

    // business logic




    function registerAirline() external requireIsOperational {
    }

//     function buy() external payable requireIsOperational {
//     }

//     function creditInsurees() external requireIsOperational {
//         // there will be an internal account on which user payments will be tracked
//         // there will be no payout here! see next method
//     }
    
//     function pay() external requireIsOperational {
//         // this method will transfer funds to the user, but noch in a push manner but in a pull manner
//         // users need to call this to get their funds payed out
//     }

//    /**
//     * @dev Initial funding for the insurance. Unless there are too many delayed flights
//     *      resulting in insurance payouts, the contract should be self-sustaining
//     */   
//     function fund() public payable requireIsOperational {
//         // airlines use this to deposit the initial 10 ETH fund to join the group
//     }

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

