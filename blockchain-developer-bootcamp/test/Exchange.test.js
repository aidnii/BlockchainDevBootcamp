import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from "./helpers";

const Token = artifacts.require("./Token");
const Exchange = artifacts.require("./Exchange");

require("chai").use(require("chai-as-promised")).should();

contract("Exchange", ([deployer, feeAccount, user1, user2]) => {
  let token;
  let exchange;
  const feePercent = 10;

  beforeEach(async () => {
    // Deploy token
    token = await Token.new();

    // Transfer some tokens to user1
    token.transfer(user1, tokens(100), { from: deployer });

    // Deploy exchange
    exchange = await Exchange.new(feeAccount, feePercent);
  });

  describe("deployment", () => {
    it("should track the fee account", async () => {
      const result = await exchange.feeAccount();
      result.should.equal(feeAccount);
    });

    it("should track the fee percentage", async () => {
      const result = await exchange.feePercent();
      result.toString().should.equal(feePercent.toString());
    });
    
  });

  describe("fallback", () => {
    it("should revert when Ether is sent", async () => {
      await exchange.sendTransaction({ value: 1, from: user1 }).should.be.rejectedWith(EVM_REVERT);
    });
  });

  describe("depositing Ether", async () => {
    let result
    let amount

    beforeEach(async () => {
      amount = ether(1);
      result = await exchange.depositEther( { from: user1, value: amount})
    })

    it("should track the ether deposit", async () => {
      const balance = await exchange.tokens(ETHER_ADDRESS, user1);
      balance.toString().should.equal(amount.toString());
    });

    it("emits an ether deposit event", async () => {
      const log = result.logs[0];
      log.event.should.eq("Deposit");
      const event = log.args;
      event.token.should.equal(ETHER_ADDRESS, "token address is correct");
      event.user.should.equal(user1, "user address is correct");
      event.amount.toString().should.equal(amount.toString(), "amount is correct");
      event.balance.toString().should.equal(amount.toString(), "balance is correct");
    });

  });

  describe("withdrawing Ether", async () => {
    let result;
    let amount;

    beforeEach(async () => {
      // Deposit Ether first
      amount = ether(1);
      await exchange.depositEther({ from: user1, value: amount });
    });

    describe("success", async () => {
      beforeEach(async () => {
        // Withdraw Ether
        result = await exchange.withdrawEther(amount, { from: user1 });
      });

      it("should withdraw Ether funds", async () => {
        const balance = await exchange.tokens(ETHER_ADDRESS, user1);
        balance.toString().should.equal('0');
      });

      it("emits a withdraw event", async () => {
        const log = result.logs[0];
        log.event.should.eq("Withdraw");
        const event = log.args;
        event.token.should.equal(ETHER_ADDRESS);
        event.user.should.equal(user1);
        event.amount.toString().should.equal(amount.toString());
        event.balance.toString().should.equal('0');
      });
    });

    describe("failure", async () => {
      it("should reject withdrawals for insufficient balances", async () => {
        await exchange.withdrawEther(ether(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      })
    });
  });

  describe("depositing tokens", () => {
    let result;
    let amount;
    
    describe('success', () => {
      beforeEach(async () => {
        amount = tokens(10);
        await token.approve(exchange.address, amount, { from: user1 });
        result = await exchange.depositToken(token.address, amount, { from: user1 });
      });

      it("should track the token deposit", async () => {
        let balance;
        // Check exchange token balance
        balance = await token.balanceOf(exchange.address);
        balance.toString().should.equal(amount.toString());
        // Check tokens on exchange
        balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      });

      it("emits a Deposit event", async () => {
        const log = result.logs[0];
        log.event.should.eq("Deposit");
        const event = log.args;
        event.token.should.equal(token.address, "token address is correct");
        event.user.should.equal(user1, "user address is correct");
        event.amount.toString().should.equal(amount.toString(), "amount is correct");
        event.balance.toString().should.equal(amount.toString(), "balance is correct");
      });
    });

    describe('failure', () => {
      it("should reject Ether deposits", async () => {
        await exchange.depositToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      });

      it("should fail when no tokens are approved", async () => {
        // Don't approve any tokens before depositing
        await exchange.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      });
    });
    
  });

  describe("withdrawing tokens", async () => {
    let result;
    let amount;

    describe("success", async () => {
      beforeEach(async () => {
        // Deposit tokens first
        amount = tokens(10);
        await token.approve(exchange.address, amount, { from: user1 });
        await exchange.depositToken(token.address, amount, { from: user1 });
        
        // Withdraw Ether
        result = await exchange.withdrawToken(token.address, amount, { from: user1 });
      });

      it("should withdraw token funds", async () => {
        const balance = await exchange.tokens(token.address, user1);
        balance.toString().should.equal('0');
      });

      it("emits a withdraw event", async () => {
        const log = result.logs[0];
        log.event.should.eq("Withdraw");
        const event = log.args;
        event.token.should.equal(token.address);
        event.user.should.equal(user1);
        event.amount.toString().should.equal(amount.toString());
        event.balance.toString().should.equal('0');
      });

    });

    describe("failure", async () => {
      it("should reject Ether withdraws", async () => {
        await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      });

      it("should fail for insufficient balances", async () => {
        // Attempts to withdraw tokens without depositing any first
        await exchange.withdrawToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe("checking balances", async () => {
    beforeEach(async () => {
      exchange.depositEther({ from: user1, value: ether(1) });
    })

    it("should return the user balance", async () => {
      const result = await exchange.balanceOf(ETHER_ADDRESS, user1);
      result.toString().should.equal(ether(1).toString());
    });
  });

  describe("making orders", async () => {
    let result;

    beforeEach(async () => {
      result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 });
    });

    it("should track the newly created order", async () => {
      const orderCount = await exchange.orderCount();
      orderCount.toString().should.equal('1');
      const order = await exchange.orders('1');
      order.id.toString().should.equal('1', 'id is correct');
      order.user.should.equal(user1, 'user is correct');
      order.getToken.should.equal(token.address, 'getToken is correct');
      order.getAmount.toString().should.equal(tokens(1).toString(), 'getAmount is correct');
      order.sendToken.should.equal(ETHER_ADDRESS, 'sendToken is correct');
      order.sendAmount.toString().should.equal(ether(1).toString(), 'sendAmount is correct');
      order.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
    });

    it("emits an Order event", async () => {
      const log = result.logs[0];
      log.event.should.eq("Order");
      const event = log.args;
      event.id.toString().should.equal('1', 'id is correct');
      event.user.should.equal(user1, 'user is correct');
      event.getToken.should.equal(token.address, 'getToken is correct');
      event.getAmount.toString().should.equal(tokens(1).toString(), 'getAmount is correct');
      event.sendToken.should.equal(ETHER_ADDRESS, 'sendToken is correct');
      event.sendAmount.toString().should.equal(ether(1).toString(), 'sendAmount is correct');
      event.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
    });

  });

  describe("order actions", async () => {
    beforeEach(async () => {
      // user1 deposits ether
      await exchange.depositEther({ from: user1, value: ether(1) });
      // user1 makes an order to buy tokens with Ether
      await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), { from: user1 });
    });

    describe("cancelling orders", async () => {
      let result;

      describe("success", async () => {
        beforeEach(async () => {
          result = await exchange.cancelOrder('1', { from: user1 });
        });
  
        it("should update cancelled orders", async () => {
          const orderCancelled = await exchange.orderCancelled(1);
          orderCancelled.should.equal(true);
        });

        it("emits a cancel event", async () => {
          const log = result.logs[0];
          log.event.should.eq("Cancel");
          const event = log.args;
          event.id.toString().should.equal('1', 'id is correct');
          event.user.should.equal(user1, 'user is correct');
          event.getToken.should.equal(token.address, 'getToken is correct');
          event.getAmount.toString().should.equal(tokens(1).toString(), 'getAmount is correct');
          event.sendToken.should.equal(ETHER_ADDRESS, 'sendToken is correct');
          event.sendAmount.toString().should.equal(ether(1).toString(), 'sendAmount is correct');
          event.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct');
        });
      });

      describe("failure", async () => {
        it("should reject invalid order IDs", async () => {
          const invalidOrderId = 99999;
          await exchange.cancelOrder(invalidOrderId, { from: user1 }).should.be.rejectedWith(EVM_REVERT);
        });

        it("should reject unauthorized cancellations", async () => {
          // Trying to cancel the order from another user
          await exchange.cancelOrder('1', { from: user2 }).should.be.rejectedWith(EVM_REVERT);
        });
      });
    });
  });
});

