pragma solidity ^0.5.0;

contract Token {
    string public name = "Web3 Talent Agency";
    string public symbol = "WTA";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track balances
    mapping(address => uint256) public balanceOf;
    // Send tokens

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }
}