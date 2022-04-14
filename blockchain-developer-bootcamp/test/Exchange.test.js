import { expect } from "chai";
import { tokens, EVM_REVERT } from "./helpers";

const Token = artifacts.require("./Token");

require("chai").use(require("chai-as-promised")).should();

contract("Token", ([deployer, receiver, exchange]) => {
  const name = "Web3 Talent Agency";
  const symbol = "WTA";
  const decimals = "18";
  const totalSupply = tokens(1000000).toString();
  let token;

  beforeEach(async () => {
    token = await Token.new();
  });

  describe("deployment", () => {
    it("", async () => {
      
    });

    
  });

});
