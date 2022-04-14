// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;
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
    // Variables
    address public feeAccount;
    uint256 public feePercent; // the fee percentage

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
}

