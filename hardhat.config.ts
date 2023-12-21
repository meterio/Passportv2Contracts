import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-truffle5";
import "@openzeppelin/hardhat-upgrades";
require("@openzeppelin/hardhat-upgrades");

import "@nomicfoundation/hardhat-toolbox";

const dotenv = require("dotenv");
dotenv.config();
// import { setGlobalDispatcher, ProxyAgent } from "undici";
// const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
// setGlobalDispatcher(proxyAgent);
import { compileSetting } from "./script/deployTool";
import { RPCS } from "./script/network";
import "./tasks";

export default {
  networks: RPCS,
  etherscan: {
    apiKey: process.env.ETHERSCAN_APIKEY,
    customChains: [
      {
        network: "arbitrum",
        chainId: 42161,
        urls: {
          apiURL: "https://api.arbiscan.io/api",
          browserURL: "https://arbiscan.io/",
        },
      },
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: `https://api-goerli.etherscan.io/api&apiKey=${process.env.ETHERSCAN_APIKEY}`,
          browserURL: "https://goerli.etherscan.io",
        },
      },
    ],
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    // enabled: true,
  },
  solidity: {
    compilers: [compileSetting("0.8.11", 200)],
  },
  mocha: {
    timeout: 200000,
  },
};
