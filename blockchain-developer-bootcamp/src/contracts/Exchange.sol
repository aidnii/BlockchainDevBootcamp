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

    constructor (address _feeAccount) public {
        feeAccount = _feeAccount;
    }
}

