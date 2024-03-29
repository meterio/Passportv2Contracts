import { task } from "hardhat/config";
import { encodeData } from "../script/deployTool";

task("encode", "get datahash")
  .addParam("amount", "deposit amount")
  .addParam("recipient", "recipient address")
  .setAction(
    async ({ handler, amount, recipient }, { ethers, run, network }) => {
      console.log(encodeData(amount, recipient));
      const coder = new ethers.utils.AbiCoder();
      console.log(coder.encode(["uint256"], [amount]));
    }
  );
