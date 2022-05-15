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

import { WETH9, Bridge, ERC20Handler, ERC721Handler, ERC1155Handler, TokenERC20 } from "./typechain"
import { deployContract } from "./script/deployTool";


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
// 0x5FbDB2315678afecb367f032d93F642f64180aa3
task("deploy-token", "deploy contract")
  .addParam("name", "token name")
  .addParam("symbol", "token symbol")
  .addParam("supply", "initial supply")
  .setAction(
    async ({ name, symbol, supply }, { ethers, run, network }) => {
      await run("compile");
      const [signer, relayer1, relayer2] = await ethers.getSigners();

      const token = await deployContract(
        "TokenERC20",
        network.name,
        ethers.getContractFactory,
        signer,
        [name, symbol, supply]
      ) as TokenERC20;

    }
  );

task("approve", "approve")
  .addParam("token", "token address")
  .addParam("spender", "spender")
  .addParam("amount", "amount")
  .setAction(
    async ({ token, spender, amount }, { ethers, run, network }) => {
      await run("compile");
      const [signer, relayer1, relayer2] = await ethers.getSigners();

      const erc20 = await ethers.getContractAt(
        "TokenERC20",
        token,
        signer
      ) as TokenERC20;

      let receipt = await erc20.approve(
        spender, amount
      )
      console.log(await receipt.wait())
    }
  );

task("deposit", "approve")
  .addParam("token", "Token address")
  .addParam("domain", "domain id")
  .addParam("bridge", "bridge address")
  .addParam("amount", "amount")
  .setAction(
    async ({ token, domain, bridge, amount }, { ethers, run, network }) => {
      await run("compile");
      const [signer, relayer1, relayer2] = await ethers.getSigners();

      const bridgeInstant = await ethers.getContractAt(
        "Bridge",
        bridge,
        signer
      ) as Bridge;

      let receipt = await bridgeInstant.deposit(
        domain,
        createResourceID(token, domain),
        ethers.utils.defaultAbiCoder.encode(['uint256'], [amount])
      )
      console.log(await receipt.wait())

    }
  );

task("deploy", "deploy contract")
  .addParam("domain", "domain id")
  .setAction(
    async ({ domain }, { ethers, run, network }) => {
      await run("compile");
      const [signer, relayer1, relayer2] = await ethers.getSigners();

      const weth = await deployContract(
        "WETH9",
        network.name,
        ethers.getContractFactory,
        signer
      ) as WETH9;

      const bridgeArgs = [
        domain,
        [relayer1.address, relayer2.address],
        2,
        0,
        999999,
        createResourceID(weth.address, domain),
        weth.address
      ]
      const bridge = await deployContract(
        "Bridge",
        network.name,
        ethers.getContractFactory,
        signer,
        bridgeArgs
      ) as Bridge;

      const erc20Handler = await deployContract(
        "ERC20Handler",
        network.name,
        ethers.getContractFactory,
        signer,
        [bridge.address]
      ) as ERC20Handler;

      const erc721Handler = await deployContract(
        "ERC721Handler",
        network.name,
        ethers.getContractFactory,
        signer,
        [bridge.address]
      ) as ERC721Handler;

      const erc1155Handler = await deployContract(
        "ERC1155Handler",
        network.name,
        ethers.getContractFactory,
        signer,
        [bridge.address]
      ) as ERC1155Handler;

    }
  );

task("resid", "get resource ID")
  .addParam("token", "Token address")
  .addParam("domain", "domain id")
  .addParam("bridge", "bridge address")
  .addParam("handler", "handler address")
  .setAction(
    async ({ token, domain, bridge, handler }, { ethers, run, network }) => {
      await run("compile");
      const [signer, relayer1, relayer2] = await ethers.getSigners();

      const bridgeInstant = await ethers.getContractAt(
        "Bridge",
        bridge,
        signer
      ) as Bridge;

      let receipt = await bridgeInstant.adminSetResource(
        handler,
        createResourceID(token, domain),
        token
      )
      console.log(await receipt.wait())
    }
  );

task("datahash", "get datahash")
  .addParam("handler", "handler address")
  .addParam("amount", "deposit amount")
  .setAction(
    async ({ handler, amount }, { ethers, run, network }) => {
      const data = '0x' +
        ethers.utils.hexZeroPad(ethers.BigNumber.from(expandDecimals(amount)).toHexString(), 32).substr(2)

      console.log(utils.solidityKeccak256(['address', 'bytes32'], [handler, data]));

    }
  );
export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/bb6d78227dca492daab0a4cfb7b32fb5`,
      accounts: ['0x7e77511687b9683be61acca40457ecb44fc7ede7e1b4733e8378c1800a423e91',
        "0x1493937792efc0eefaec982bfa70e3eb7cb099606245fd8a7d7291ee862537dd", // Bob Private Key
        "0x3220b7e5e8679dc1b3176dd0f24c47910214632a608050198eae5f50ea2c4f5f",],
      chainId: 4,
      gasPrice: 2000000000,
    }
  },
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
