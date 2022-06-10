import "hardhat-typechain";
import "@nomiclabs/hardhat-truffle5";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import { task } from "hardhat/config";
import { compileSetting, allowVerifyChain } from "./script/deployTool";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { RPCS } from "./script/network";
const SHA256 = require('crypto-js/sha256')
require('@openzeppelin/hardhat-upgrades');
const dotenv = require("dotenv");
dotenv.config();
// import Colors = require("colors.ts");
import { BigNumber, BytesLike, constants, utils, Signer } from "ethers";

import {
  Bridge,
  ERC20Handler,
  ERC721Handler,
  ERC1155Handler,
  GenericHandler,
  TokenERC20,
  BasicFeeHandler
} from "./typechain"
import { deployContract, getContract } from "./script/deployTool";
import { boolean } from "hardhat/internal/core/params/argumentTypes";
import { getSign } from "./script/permitSign";

type Config = {
  name: string;
  type: string;
  id: number;
  from: string;
  bridge: string;
  erc20Handler: string;
  erc721Handler: string;
  erc1155Handler: string;
  genericHandler: string;
  feeHandler: string;
  tokens: Token[];
}

type Token = {
  address: string;
  name: string;
  symbol: string;
  native: boolean;
  decimals: number;
  resourceId: string;
}


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

function loadConfig(network: string): Config {
  const path = `./deployments/${network}/`;
  const latest = `config.json`;

  if (existsSync(path + latest)) {
    let json = JSON.parse(readFileSync(path + latest).toString()) as Config;
    return json;
  } else {

    let json: Config = {
      name: "",
      type: "",
      id: 0,
      from: "",
      bridge: "",
      erc20Handler: "",
      erc721Handler: "",
      erc1155Handler: "",
      genericHandler: "",
      feeHandler: "",
      tokens: []
    };
    return json;
  }
}

function saveConfig(network: string, json: Config) {
  const path = `./deployments/${network}/`;
  const latest = `config.json`;

  mkdirSync(path, { recursive: true });
  writeFileSync(path + latest, JSON.stringify(json));
}

task("deploy", "deploy contract")
  .addParam("contract", "contract")
  .addOptionalParam("domain", "domain id", "0")
  .setAction(
    async ({ contract, domain }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0]
      const relayer1 = signers[1]
      const relayer2 = signers[2]
      let config = loadConfig(network.name);

      if (contract == 'bridge') {
        domain = domain ? domain : config.id;
        if (domain) {
          const bridgeArgs = [
            domain,
            [relayer1.address, relayer2.address],
            2,
            999999
          ]
          const instant = await deployContract(
            "Bridge",
            network.name,
            ethers.getContractFactory,
            deployer,
            bridgeArgs
          ) as Bridge;
          config.bridge = instant.address;
          config.name = network.name;
          config.type = "evm";
          config.from = deployer.address;
          config.id = domain;
        }
      } else if (contract == "erc20Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const instant = await deployContract(
            "ERC20Handler",
            network.name,
            ethers.getContractFactory,
            deployer,
            [bridgeAddress]
          ) as ERC20Handler;
          config.erc20Handler = instant.address;
        }
      } else if (contract == "erc721Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const instant = await deployContract(
            "ERC721Handler",
            network.name,
            ethers.getContractFactory,
            deployer,
            [bridgeAddress]
          ) as ERC721Handler;
          config.erc721Handler = instant.address;
        }
      } else if (contract == "erc1155Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const instant = await deployContract(
            "ERC1155Handler",
            network.name,
            ethers.getContractFactory,
            deployer,
            [bridgeAddress]
          ) as ERC1155Handler;
          config.erc1155Handler = instant.address;
        }
      } else if (contract == "genericHandler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const instant = await deployContract(
            "GenericHandler",
            network.name,
            ethers.getContractFactory,
            deployer,
            [bridgeAddress]
          ) as GenericHandler;
          config.genericHandler = instant.address;
        }
      } else if (contract == "feeHandler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const instant = await deployContract(
            "BasicFeeHandler",
            network.name,
            ethers.getContractFactory,
            deployer,
            [bridgeAddress]
          ) as BasicFeeHandler;
          config.feeHandler = instant.address;
        }
      }
      saveConfig(network.name, config);
    }
  );


task("deploy-token", "deploy contract")
  .addParam("name", "token name", "")
  .addParam("symbol", "token symbol", "")
  .addParam("amount", "token amount", "")
  .addParam("from", "from domain id", "")
  .setAction(
    async ({ name, symbol, amount, from }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[3]
      let config = loadConfig(network.name);
      const instant = await deployContract(
        "TokenERC20",
        network.name,
        ethers.getContractFactory,
        deployer,
        [name, symbol, amount]
      ) as TokenERC20;
      let token: Token = {
        address: instant.address,
        decimals: 18,
        name: name,
        symbol: symbol,
        native: false,
        resourceId: createResourceID(instant.address, from),
      }
      config.tokens.push(token);

      saveConfig(network.name, config);
    }
  );

task("regresid", "get resource ID")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);
      let tokens = config.tokens;

      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      for (let i = 0; i < tokens.length; i++) {
        let handlerAddress = await bridgeInstant._resourceIDToHandlerAddress(tokens[i].resourceId);
        if (handlerAddress == constants.AddressZero) {
          let receipt = await bridgeInstant.adminSetResource(
            config.erc20Handler,
            tokens[i].resourceId,
            tokens[i].address
          )
          console.log(await receipt.wait())
        } else {
          console.log("handlerAddress:", handlerAddress)
        }
      }
    }
  );

task("reg-native", "regist native")
  .addParam("from", "from domain id", "")
  .addParam("name", "token name", "")
  .addParam("symbol", "token symbol", "")
  .setAction(
    async ({ from, name, symbol }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);

      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      const nativeAddress = "0x0000000000000000000000000000000000000001";
      const resid = createResourceID(nativeAddress, from);

      if (Number(from) == config.id) {
        let handlerAddress = await bridgeInstant._resourceIDToHandlerAddress(resid);

        if (handlerAddress == constants.AddressZero) {
          let receipt = await bridgeInstant.adminSetResource(
            config.erc20Handler,
            resid,
            nativeAddress
          )
          handlerAddress = config.erc20Handler;
          console.log(await receipt.wait())
        } else {
          console.log("handlerAddress:", handlerAddress)
        }

        const erc20Handler = await ethers.getContractAt("ERC20Handler", config.erc20Handler, deployer) as ERC20Handler;
        const isWtoken = await erc20Handler.isWtoken(nativeAddress);

        if (!isWtoken) {
          let receipt = await bridgeInstant.adminSetWtoken(resid, nativeAddress, true);
          console.log(await receipt.wait())
        }
        let token: Token = {
          address: nativeAddress,
          decimals: 18,
          name: name,
          symbol: symbol,
          native: true,
          resourceId: resid,
        }
        config.tokens.push(token);
      } else {
        const instant = await deployContract(
          "TokenERC20",
          network.name,
          ethers.getContractFactory,
          deployer,
          [name, symbol, 0]
        ) as TokenERC20;
        let token: Token = {
          address: instant.address,
          decimals: 18,
          name: name,
          symbol: symbol,
          native: false,
          resourceId: resid,
        }
        config.tokens.push(token);
      }
      saveConfig(network.name, config);
    }
  );

task("setfee", "set fee handler")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);
      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      let receipt = await bridgeInstant.adminChangeFeeHandler(config.feeHandler);
      console.log(await receipt.wait())
    }
  );

task("set-threshold", "set threshold")
.addParam("threshold", "threshold", "")
  .setAction(
    async ({ threshold}, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);
      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      let receipt = await bridgeInstant.adminChangeRelayerThreshold(threshold);
      console.log(await receipt.wait())
    }
  );

task("setburn", "get resource ID")
  .addParam("tokenIndex", "Token address")
  .setAction(
    async ({ tokenIndex }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);

      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;

      let receipt = await bridgeInstant.adminSetBurnable(
        config.erc20Handler,
        config.tokens[tokenIndex].address
      )
      console.log(await receipt.wait())
    }
  );

task("resid", "get resource ID")
  .addParam("token", "Token address")
  .addParam("domain", "domain id")
  .setAction(
    async ({ token, domain, bridge, handler }, { ethers, run, network }) => {

      console.log(createResourceID(token, domain))
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

task("sign", "get sign")
  .addParam("bridge", "bridge address")
  .addParam("domain", "domain id")
  .addParam("nonce", "depositNonce")
  .addParam("token", "Token address")
  .addParam("amount", "deposit amount")
  .addParam("recipient", "recipient address")
  .addParam("chainid", "chainId")
  .addParam("relayer", "relayer")
  .setAction(
    async ({ bridge, domain, nonce, token, amount, recipient, chainid, relayer }, { ethers, run, network }) => {
      const signer = await ethers.getSigners();

      let signature = await getSign(
        signer[relayer] as Signer,
        bridge,
        domain,
        nonce,
        createResourceID(token, Number(domain)),
        encodeData(amount, recipient),
        chainid
      );
      console.log(signature)
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
