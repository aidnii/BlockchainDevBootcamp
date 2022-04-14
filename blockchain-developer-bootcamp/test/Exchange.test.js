import { expect } from "chai";
import { tokens, EVM_REVERT } from "./helpers";

const Exchange = artifacts.require("./Exchange");

require("chai").use(require("chai-as-promised")).should();

contract("Exchange", ([deployer, feeAccount]) => {
  let exchange;
  const  feePercent = 10;

  beforeEach(async () => {
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

});
