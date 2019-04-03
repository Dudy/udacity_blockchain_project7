pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {

    using SafeMath for uint256;

    address private contractOwner;
    bool private operational = true;

    constructor() public {
        contractOwner = msg.sender;
    }

    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;
    }

    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    function isOperational() public view returns(bool) {
        return operational;
    }

    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function registerAirline() external pure /*this is only for the compiler, remove when you start coding the method!*/ requireIsOperational {
    }

    function buy() external payable requireIsOperational {
    }

    function creditInsurees() external pure /* this is only for the compiler, remove when you start coding the method! */ requireIsOperational {
        // there will be an internal account on which user payments will be tracked
        // there will be no payout here! see next method
    }
    
    function pay() external pure /* this is only for the compiler, remove when you start coding the method! */ requireIsOperational {
        // this method will transfer funds to the user, but noch in a push manner but in a pull manner
        // users need to call this to get their funds payed out
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    */   
    function fund() public payable requireIsOperational {
        // airlines use this to deposit the initial 10 ETH fund to join the group
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    */
    function() external payable {
        fund();
    }
}

