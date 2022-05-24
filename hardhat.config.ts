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
import { BigNumber, BytesLike, constants, utils } from "ethers";

import { WETH9, Bridge, ERC20Handler, ERC721Handler, ERC1155Handler, GenericHandler, TokenERC20 } from "./typechain"
import { deployContract, getContract } from "./script/deployTool";
import { boolean } from "hardhat/internal/core/params/argumentTypes";


const toHex = (covertThis: BytesLike, padding: number): string => {
  return utils.hexZeroPad(utils.hexlify(covertThis), padding);
};

const createResourceID = (contractAddress: string, domainID: number) => {
  return toHex(contractAddress + toHex(BigNumber.from(domainID).toHexString(), 1).substr(2), 32)
};

const expandDecimals = (amount: any, decimals = 18) => {
  return utils.parseUnits(String(amount), decimals);
}

const encodeData = (amount: string, recipient: string) => {
  const data = '0x' +
    utils.hexZeroPad(BigNumber.from(expandDecimals(amount)).toHexString(), 32).substr(2) +  // Deposit Amount        (32 bytes)
    utils.hexZeroPad(utils.hexlify((recipient.length - 2) / 2), 32).substr(2) +    // len(recipientAddress) (32 bytes)
    recipient.substr(2);                    // recipientAddress      (?? bytes)
  return data;
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
task("depositToken", "deposit contract")
  .addOptionalParam("force", "force deploy", false, boolean)
  .addParam("domain", "domain id")
  .setAction(
    async ({ force, domain }, { ethers, run, network }) => {
      await run("compile");
      const [signer, relayer1, relayer2] = await ethers.getSigners();
      let token: TokenERC20;

      const tokenJson = getContract(network.name, "TokenERC20");
      if (force || tokenJson == "") {
        token = await deployContract(
          "TokenERC20",
          network.name,
          ethers.getContractFactory,
          signer,
          ["TT", "TTT", "100000000000000000000000000"]
        ) as TokenERC20;
      } else {
        token = await ethers.getContractAt("TokenERC20", tokenJson.address, signer) as TokenERC20;
      }

      const erc20HandlerJson = getContract(network.name, "ERC20Handler");
      if (erc20HandlerJson != "") {
        await token.transfer(erc20HandlerJson.address, "100000000000000000000000000")
      }

      const bridgeJson = getContract(network.name, "Bridge");
      if (bridgeJson != "") {
        const resId = createResourceID(token.address, domain);
        const bridgeInstant = await ethers.getContractAt("Bridge", bridgeJson.address, signer) as Bridge;
        let receipt = await bridgeInstant.adminSetResource(
          erc20HandlerJson.address,
          resId,
          token.address
        )
        console.log(await receipt.wait());
      }
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

task("deposit", "deposit")
  .addParam("domain", "domain id")
  .setAction(
    async ({ domain }, { ethers, run, network }) => {
      await run("compile");
      const [signer, relayer1, relayer2] = await ethers.getSigners();

      const tokenJson = getContract(network.name, "TokenERC20");
      const token = await ethers.getContractAt("TokenERC20", tokenJson.address, signer) as TokenERC20;

      const bridgeJson = getContract(network.name, "Bridge");
      const bridgeInstant = await ethers.getContractAt("Bridge", bridgeJson.address, signer) as Bridge;

      const resId = createResourceID(token.address, domain);
      const handlerAddress = await bridgeInstant._resourceIDToHandlerAddress(resId);

      let receipt = await token.approve(handlerAddress, expandDecimals("1"));
      console.log("Approve:", receipt.hash)

      console.log(
        domain,
        resId,
        encodeData("1", signer.address)
      )
      receipt = await bridgeInstant.deposit(
        domain,
        resId,
        encodeData("1", signer.address),
        constants.HashZero
      )
      console.log(await receipt.wait());

    }
  );

task("deploy", "deploy contract")
  .addParam("domain", "domain id")
  .addOptionalParam("force", "force deploy", false, boolean)
  .addOptionalParam("weth", "weth address", "")
  .setAction(
    async ({ domain, force, weth }, { ethers, run, network }) => {
      await run("compile");
      const [signer, relayer1, relayer2] = await ethers.getSigners();
      let bridge: Bridge;
      let weth9: WETH9;

      const weth9Json = getContract(network.name, "WETH9");
      if (weth != "") {
        weth9 = await ethers.getContractAt("WETH9", weth9Json.address, signer) as WETH9;
      } else if (!force && weth9Json != "") {
        weth9 = await ethers.getContractAt("WETH9", weth9Json.address, signer) as WETH9;
      } else {
        weth9 = await deployContract(
          "WETH9",
          network.name,
          ethers.getContractFactory,
          signer
        ) as WETH9;
      }

      const bridgeJson = getContract(network.name, "Bridge");
      if (!force && weth9Json != "") {
        bridge = await ethers.getContractAt("Bridge", bridgeJson.address, signer) as Bridge;
      } else {
        const bridgeArgs = [
          domain,
          [relayer1.address, relayer2.address],
          2,
          0,
          999999,
          createResourceID(weth9.address, domain),
          weth9.address
        ]
        bridge = await deployContract(
          "Bridge",
          network.name,
          ethers.getContractFactory,
          signer,
          bridgeArgs
        ) as Bridge;

      }

      if (force || getContract(network.name, "ERC20Handler") == "") {
        const erc20Handler = await deployContract(
          "ERC20Handler",
          network.name,
          ethers.getContractFactory,
          signer,
          [bridge.address]
        ) as ERC20Handler;
      }
      if (force || getContract(network.name, "ERC721Handler") == "") {
        const erc721Handler = await deployContract(
          "ERC721Handler",
          network.name,
          ethers.getContractFactory,
          signer,
          [bridge.address]
        ) as ERC721Handler;
      }
      if (force || getContract(network.name, "ERC1155Handler") == "") {
        const erc1155Handler = await deployContract(
          "ERC1155Handler",
          network.name,
          ethers.getContractFactory,
          signer,
          [bridge.address]
        ) as ERC1155Handler;
      }
      if (force || getContract(network.name, "GenericHandler") == "") {
        const genericHandler = await deployContract(
          "GenericHandler",
          network.name,
          ethers.getContractFactory,
          signer,
          [bridge.address]
        ) as GenericHandler;
      }
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
  .addParam("recipient", "recipient address")
  .setAction(
    async ({ handler, amount, recipient }, { ethers, run, network }) => {
      const data = '0x' +
        ethers.utils.hexZeroPad(ethers.BigNumber.from(expandDecimals(amount)).toHexString(), 32).substr(2) +  // Deposit Amount        (32 bytes)
        ethers.utils.hexZeroPad(ethers.utils.hexlify((recipient.length - 2) / 2), 32).substr(2) +    // len(recipientAddress) (32 bytes)
        recipient.substr(2);                    // recipientAddress      (?? bytes)

      console.log(utils.solidityKeccak256(['address', 'bytes32'], [handler, data]));

    }
  );
task("encode", "get datahash")
  .addParam("amount", "deposit amount")
  .addParam("recipient", "recipient address")
  .setAction(
    async ({ handler, amount, recipient }, { ethers, run, network }) => {
      console.log(encodeData(amount, recipient));
    }
  );
export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/bb6d78227dca492daab0a4cfb7b32fb5`,
      accounts: ['0x278e623d5c3445753374f065a7ad9c76d82a642e416ac670d7d90eafd4a34ad0',
        "0xaee9f26de5275ecad2d50354c616b76a8981d4c543964dcd094d07a30235a735", // Bob Private Key
        "0x402a7d83a9c142b898c280eb1ace8282fbde4adfbf8e5cbbb15145bb3c7e5bdf",],
      chainId: 4,
      gasPrice: 2000000000,
    },
    bsctest: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: ['0x278e623d5c3445753374f065a7ad9c76d82a642e416ac670d7d90eafd4a34ad0',
        "0xaee9f26de5275ecad2d50354c616b76a8981d4c543964dcd094d07a30235a735", // Bob Private Key
        "0x402a7d83a9c142b898c280eb1ace8282fbde4adfbf8e5cbbb15145bb3c7e5bdf",],
      chainId: 97,
      gasPrice: 10000000000,
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
