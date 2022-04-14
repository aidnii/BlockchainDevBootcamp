import { expect } from "chai";
import { tokens, EVM_REVERT } from "./helpers";

const Exchange = artifacts.require("./Exchange");

require("chai").use(require("chai-as-promised")).should();

contract("Exchange", ([deployer, feeAccount]) => {
  let exchange;

  beforeEach(async () => {
    exchange = await Exchange.new();
  });

  describe("deployment", () => {
    it("should track the fee account", async () => {
      
    });

    
  });

});
