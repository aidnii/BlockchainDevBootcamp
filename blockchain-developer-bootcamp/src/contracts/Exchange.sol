// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Token.sol";

// Creating an exchange that can Deposit & withdraw funds
// Manage orders by making or canceling orders
// handle trades - charge fees
 
// To Do:
// [x] Set the account fee
// [x] Deposit ether
// [x] Withdraw ether
// [x] Deposit tokens
// [x] Withdraw tokens
// [x] Check Balances
// [x] Make order
// [ ] Cancel order
// [ ] Fill order
// [ ] Charge fees

contract Exchange {
    using SafeMath for uint256;

    // Variables
    address public feeAccount;
    uint256 public feePercent; // the fee percentage
    address constant ETHER = address(0); // store Ether in tokens mapping with blank address
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders; // Store the order on the blockchain
    uint256 public orderCount; // keep track of orders as counter cache
    mapping(uint256 => bool) public orderCancelled;

    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(uint256 id, address user, address getToken, uint256 getAmount, address sendToken, uint256 sendAmount, uint256 timestamp);
    event Cancel(uint256 id, address user, address getToken, uint256 getAmount, address sendToken, uint256 sendAmount, uint256 timestamp);

    // Structs - Model the order
    struct _Order {
        uint256 id;
        address user;
        address getToken;
        uint256 getAmount;
        address sendToken;
        uint256 sendAmount;
        uint256 timestamp;
    }
    
    // Add the order to Storage

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Fallback: reverts if Ether is sent to this smart contract by mistake
    function() external {
        revert();
    }

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        msg.sender.transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    function makeOrder(address _getToken, uint256 _getAmount, address _sendToken, uint256 _sendAmount) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _getToken, _getAmount, _sendToken, _sendAmount, now);
        emit Order(orderCount, msg.sender, _getToken, _getAmount, _sendToken, _sendAmount, now);
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender);
        require(_order.id == _id); // The order must exist
        orderCancelled[_id] = true;
        emit Cancel(_order.id, msg.sender, _order.getToken, _order.getAmount, _order.sendToken, _order.sendAmount, now);
    }
}


