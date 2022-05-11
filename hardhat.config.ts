import "hardhat-typechain";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import { task } from "hardhat/config";
import { compileSetting, allowVerifyChain } from "./script/deployTool";
import { RPCS } from "./script/network";
const SHA256 = require('crypto-js/sha256')
require('@openzeppelin/hardhat-upgrades');
const dotenv = require("dotenv");
dotenv.config();
// import Colors = require("colors.ts");
import { BigNumber, BytesLike, utils } from "ethers";

import { Bridge } from "./typechain"


const toHex = (covertThis: BytesLike, padding: number): string => {
  return utils.hexZeroPad(utils.hexlify(covertThis), padding);
};

const createResourceID = (contractAddress: string, domainID: number) => {
  return toHex(contractAddress + toHex(BigNumber.from(domainID).toHexString(), 1).substr(2), 32)
};

const expandDecimals = (amount, decimals = 18) => {
  return utils.parseUnits(String(amount), decimals);
}

task("accounts", "Prints the list of accounts", async (taskArgs, bre) => {
  const accounts = await bre.ethers.getSigners();

  for (const account of accounts) {
    let address = await account.getAddress();
    console.log(
      address,
      (await bre.ethers.provider.getBalance(address)).toString()
    );
  }
});


task("resid", "get resource ID")
  .addParam("address", "Token address")
  .addParam("domain", "domain id")
  .setAction(
    async ({ address, domain }, { ethers, run, network }) => {
      console.log(createResourceID(address, domain));

    }
  );

task("datahash", "get datahash")
  .addParam("handler", "handler address")
  .addParam("amount", "deposit amount")
  .setAction(
    async ({ handler, amount }, { ethers, run, network }) => {
      const data = '0x' +
        ethers.utils.hexZeroPad(ethers.BigNumber.from(expandDecimals(amount)).toHexString(), 32).substr(2)
      
      console.log(utils.solidityKeccak256(['address', 'bytes32'], [handler, 'data']));

    }
  );
export default {
  networks: RPCS,
  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
  },
  solidity: {
    compilers: [compileSetting("0.8.11", 200)],
  },
  mocha: {
    timeout: 200000,
  },
};
