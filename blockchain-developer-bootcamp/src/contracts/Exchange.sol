// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Token.sol";

// Creating an exchange that can Deposit & withdraw funds
// Manage orders by making or canceling orders
// handle trades - charge fees
 
// To Do:
// [ ] Set the account fee
// [ ] Deposit ether
// [ ] Withdraw ether
// [ ] Deposit tokens
// [ ] Withdraw tokens
// [ ] Check Balances
// [ ] Make order
// [ ] Cancel order
// [ ] Fill order
// [ ] Charge fees

contract Exchange {
    using SafeMath for uint;

    // Variables
    address public feeAccount;
    uint256 public feePercent; // the fee percentage
    mapping(address => mapping(address => uint256)) public tokens;

    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function tokenDeposit(address _token, uint _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
}


