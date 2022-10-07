import "hardhat-typechain";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import { compileSetting } from "./script/deployTool";
import { RPCS } from "./script/network";
require('@openzeppelin/hardhat-upgrades');
const dotenv = require("dotenv");
dotenv.config();
import { setGlobalDispatcher, ProxyAgent } from "undici";
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);
import "./tasks";

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

