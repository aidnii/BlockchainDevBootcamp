import { tokens, ether, EVM_REVERT, ETHERS_ADDRESS } from "./helpers";

const Token = artifacts.require("./Token");
const Exchange = artifacts.require("./Exchange");

require("chai").use(require("chai-as-promised")).should();

contract("Exchange", ([deployer, feeAccount, user1]) => {
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

  describe("depositing Ether", async () => {
    let result
    let amount

    beforeEach(async () => {
      amount = ether(1);
      result = await exchange.depositEther( { from: user1, value: amount})
    })

    it("should track the ether deposit", async () => {
      const balance = await exchange.tokens(ETHERS_ADDRESS, user1);
      balance.toString().should.equal(amount.toString());
    });

    it("emits an ether deposit event", async () => {
      const log = result.logs[0];
      log.event.should.eq("Deposit");
      const event = log.args;
      event.token.should.equal(ETHERS_ADDRESS, "token address is correct");
      event.user.should.equal(user1, "user address is correct");
      event.amount.toString().should.equal(amount.toString(), "amount is correct");
      event.balance.toString().should.equal(amount.toString(), "balance is correct");
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
        await exchange.depositToken(ETHERS_ADDRESS, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      });

      it("should fail when no tokens are approved", async () => {
        // Don't approve any tokens before depositing
        await exchange.depositToken(token.address, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT);
      });
    });
    
  });

});

