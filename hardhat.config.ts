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
  BasicFeeHandler,
  Signatures
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
  from: number;
  native: boolean;
  decimals: number;
  resourceId: string;
}

const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const toHex = (covertThis: BytesLike, padding: number): string => {
  return utils.hexZeroPad(utils.hexlify(covertThis), padding);
};

const createResourceID = (contractAddress: string, domainID: number) => {
  return toHex(contractAddress + toHex(BigNumber.from(domainID).toHexString(), 1).substr(2), 32)
};

const expandDecimals = (amount: any, decimals = 18): BigNumber => {
  return utils.parseUnits(String(amount), decimals);
}

const encodeData = (amount: string, recipient: string) => {
  const data = '0x' +
    utils.hexZeroPad(expandDecimals(amount).toHexString(), 32).substr(2) +  // Deposit Amount        (32 bytes)
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
      let config = loadConfig(network.name);

      if (contract == 'bridge') {
        domain = domain ? domain : config.id;
        if (domain) {
          const bridgeArgs = [
            domain,
            [],
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
          const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
          let receipt = await bridgeInstant.adminChangeFeeHandler(config.feeHandler);
          console.log(await receipt.wait())
        }
      }
      saveConfig(network.name, config);
    }
  );


task("deploy-signature", "deploy signature contract")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0]

      const instant = await deployContract(
        "Signatures",
        network.name,
        ethers.getContractFactory,
        deployer
      ) as Signatures;
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
      const deployer = signers[0]
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
        from: from,
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
      const erc20HandlerInstant = await ethers.getContractAt("ERC20Handler", config.erc20Handler, deployer) as ERC20Handler;
      for (let i = 0; i < tokens.length; i++) {
        let resid = await erc20HandlerInstant._tokenContractAddressToResourceID(tokens[i].address);
        if (resid == constants.HashZero) {
          let receipt = await bridgeInstant.adminSetResource(
            config.erc20Handler,
            tokens[i].resourceId,
            tokens[i].address
          )
          console.log(await receipt.wait())
        } else {
          console.log("resid:", resid)
          console.log("whitelisted:", await erc20HandlerInstant._contractWhitelist(tokens[i].address))
          console.log("_burnList:", await erc20HandlerInstant._burnList(tokens[i].address))
          console.log("token:", await erc20HandlerInstant._resourceIDToTokenContractAddress(resid))
          console.log("_resourceIDToHandlerAddress:", await bridgeInstant._resourceIDToHandlerAddress(resid))
        }
      }
    }
  );

task("deploy-native", "regist native")
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
          from: from,
          resourceId: resid,
        }
        config.tokens.push(token);
      } else {
        const tokenInstant = await deployContract(
          "TokenERC20",
          network.name,
          ethers.getContractFactory,
          deployer,
          [name, symbol, 0]
        ) as TokenERC20;
        let token: Token = {
          address: tokenInstant.address,
          decimals: 18,
          name: name,
          symbol: symbol,
          native: false,
          from: from,
          resourceId: resid,
        }
        config.tokens.push(token);
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
        const erc20HandlerInstant = await ethers.getContractAt("ERC20Handler", config.erc20Handler, deployer) as ERC20Handler;
        let burnList = await erc20HandlerInstant._burnList(token.address);
        if (!burnList) {
          let receipt = await bridgeInstant.adminSetBurnable(
            config.erc20Handler,
            token.address
          )
          console.log(await receipt.wait())
        }
        let hasRole = await tokenInstant.hasRole(MINTER_ROLE, config.erc20Handler);
        if (!hasRole) {
          let receipt = await tokenInstant.grantRole(
            MINTER_ROLE,
            config.erc20Handler
          )
          console.log(await receipt.wait())
        }
      }
      saveConfig(network.name, config);
    }
  );

task("reg-native", "regist native")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);

      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      const nativeAddress = "0x0000000000000000000000000000000000000001";
      const resid = createResourceID(nativeAddress, config.id);

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
    async ({ threshold }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);
      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      let receipt = await bridgeInstant.adminChangeRelayerThreshold(threshold);
      console.log(await receipt.wait())
    }
  );

task("setburn", "setburn")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      const minter = signers[0];
      let config = loadConfig(network.name);
      let tokens = config.tokens;


      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      const erc20HandlerInstant = await ethers.getContractAt("ERC20Handler", config.erc20Handler, deployer) as ERC20Handler;

      // const nativeAddress = "0x0000000000000000000000000000000000000001";
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].from != Number(config.id)) {
          let burnList = await erc20HandlerInstant._burnList(tokens[i].address);
          if (!burnList) {
            let receipt = await bridgeInstant.adminSetBurnable(
              config.erc20Handler,
              tokens[i].address
            )
            console.log(await receipt.wait())
          }
          let token = await ethers.getContractAt("TokenERC20", tokens[i].address, minter) as TokenERC20;
          let hasRole = await token.hasRole(MINTER_ROLE, config.erc20Handler);
          if (!hasRole) {
            let receipt = await token.grantRole(
              MINTER_ROLE,
              config.erc20Handler
            )
            console.log(await receipt.wait())
          }
        }
      }
    }
  );
task("set-fee", "set fee")
  .addParam("fee", "fee")
  .addParam("special", "special")
  .setAction(
    async ({ fee, special }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);

      let feeInstant = await ethers.getContractAt("BasicFeeHandler", config.feeHandler, deployer) as BasicFeeHandler;

      let receipt = await feeInstant.changeFee(fee);
      console.log(await receipt.wait())
      receipt = await feeInstant.setSpecialFee(config.id, special);
      console.log(await receipt.wait())
    }
  );

task("faucet", "faucet")
  .addParam("to", "to")
  .setAction(
    async ({ to }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const minter = signers[4];
      let config = loadConfig(network.name);
      let tokens = config.tokens;

      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].address != "0x0000000000000000000000000000000000000001") {
          const token = await ethers.getContractAt("TokenERC20", tokens[i].address, minter) as TokenERC20;
          if ((await token.balanceOf(minter.address)).gt(BigNumber.from(0))) {
            let receipt = await token.transfer(to, "100000000000000000000000")
            console.log(await receipt.wait())
          }
        }
      }
    }
  );

task("add-relayer", "adminAddRelayer")
  .addParam("relayer", "relayer address")
  .setAction(
    async ({ relayer }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      let config = loadConfig(network.name);
      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      let receipt = await bridgeInstant.adminAddRelayer(relayer)
      console.log(await receipt.wait())
    }
  );



task("awe", "admin-withdraw-eth")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      const minter = signers[4];
      let config = loadConfig(network.name);

      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      const balance = await ethers.provider.getBalance(config.erc20Handler);
      const encoder = new ethers.utils.AbiCoder();
      const data = encoder.encode(["address", "uint256"], [minter.address, balance]);
      console.log("data:", data)
      let receipt = await bridgeInstant.adminWithdrawETH(config.erc20Handler, data)
      console.log(await receipt.wait())
    }
  );


task("trace", "trace setburn")
  .addParam("index", "index")
  .setAction(
    async ({ index }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      const minter = signers[4];
      let config = loadConfig(network.name);

      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
      const erc20HandlerInstant = await ethers.getContractAt("ERC20Handler", config.erc20Handler, deployer) as ERC20Handler;
      const token = await ethers.getContractAt("TokenERC20", config.tokens[index].address, deployer) as TokenERC20;

      console.log(await token.balanceOf(minter.address))
      console.log("_resourceIDToHandlerAddress", await bridgeInstant._resourceIDToHandlerAddress(config.tokens[index].resourceId));

    }
  );

task("deposit", "faucet")
  .addParam("amount", "amount")
  .addParam("to", "to")
  .setAction(
    async ({ to, amount }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const minter = signers[4];
      let config = loadConfig(network.name);
      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, minter) as Bridge;

      const token = config.tokens[1];
      const tokenInstant = await ethers.getContractAt("TokenERC20", token.address, minter) as TokenERC20;
      const allowance = await tokenInstant.allowance(minter.address, config.erc20Handler);
      if (allowance.lt(expandDecimals(amount))) {
        let receipt = await tokenInstant.approve(config.erc20Handler, constants.MaxUint256);
        console.log(await receipt.wait());
      }

      const data = encodeData(amount, minter.address);
      const fee = await bridgeInstant.calculateFee(
        to,
        token.resourceId,
        data,
        constants.HashZero
      )

      console.log({
        to: to, resid: token.resourceId, data: data, fee: fee.toString(), override: { value: fee }
      })
      let receipt = await bridgeInstant.deposit(to, token.resourceId, data, constants.HashZero, { value: fee })
      console.log(await receipt.wait())

    });

task("deposit-eth", "faucet")
  .addParam("amount", "amount")
  .addParam("to", "to")
  .setAction(
    async ({ to, amount }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const minter = signers[4];
      let config = loadConfig(network.name);
      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, minter) as Bridge;
      const token = config.tokens[0];

      const data = encodeData(amount, minter.address);
      const fee = await bridgeInstant.calculateFee(
        to,
        token.resourceId,
        data,
        constants.HashZero
      )

      console.log({
        to: to, resid: token.resourceId, data: data, fee: fee.toString(), override: { value: expandDecimals(amount).add(fee) }
      })
      let receipt = await bridgeInstant.deposit(to, token.resourceId, data, constants.HashZero, { value: expandDecimals(amount).add(fee) })
      console.log(await receipt.wait())

    });
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
  .addParam("resid", "resourceID")
  .addParam("data", "deposit data")
  .addParam("chainid", "chainId")
  .addParam("relayer", "relayer")
  .setAction(
    async ({ bridge, domain, nonce, resid, data, chainid, relayer }, { ethers, run, network }) => {
      const signer = await ethers.getSigners();

      let signature = await getSign(
        signer[relayer] as Signer,
        bridge,
        domain,
        nonce,
        resid,
        data,
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
