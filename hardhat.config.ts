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
import { setGlobalDispatcher, ProxyAgent } from "undici";
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890");
setGlobalDispatcher(proxyAgent);
// import Colors = require("colors.ts");
import { BigNumber, BytesLike, constants, utils, Signer, VoidSigner, Contract } from "ethers";

import {
  Bridge,
  ERC20Handler,
  ERC721Handler,
  ERC1155Handler,
  GenericHandler,
  TokenERC20,
  Signatures,
  SignaturesUpgradeable,
  BridgeUpgradeable,
  ERC20HandlerUpgradeable,
  ERC721HandlerUpgradeable,
  ERC1155HandlerUpgradeable,
  GenericHandlerUpgradeable,
  TransparentUpgradeableProxy,
  ERC20MintablePauseableUpgradeable
} from "./typechain"
import { deployContract } from "./script/deployTool";
import { getSign } from "./script/permitSign";
import { parseUnits } from "ethers/lib/utils";

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
  signature: string;
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

function loadConfig(network: string, proxy: boolean = false): Config {
  const path = `./deployments/${network}/`;
  const latest = proxy ? `config-proxy.json` : `config.json`;

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
      signature: "",
      tokens: []
    };
    return json;
  }
}

function saveConfig(network: string, json: Config, proxy: boolean = false) {
  const path = `./deployments/${network}/`;
  const latest = proxy ? `config-proxy.json` : `config.json`;

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
      }
      saveConfig(network.name, config);
    }
  );

task("proxy-admin", "transfer proxy admin")
  .addParam("admin", "address")
  .setAction(
    async ({ admin }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0]
      let config = loadConfig(network.name, true);

      const bridge = await ethers.getContractAt("TransparentUpgradeableProxy", config.bridge, deployer) as TransparentUpgradeableProxy;
      await bridge.changeAdmin(admin);

      const erc20Handler = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc20Handler, deployer) as TransparentUpgradeableProxy;
      await erc20Handler.changeAdmin(admin);

      const erc721Handler = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc721Handler, deployer) as TransparentUpgradeableProxy;
      await erc721Handler.changeAdmin(admin);

      const erc1155Handler = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc1155Handler, deployer) as TransparentUpgradeableProxy;
      await erc1155Handler.changeAdmin(admin);

      const genericHandler = await ethers.getContractAt("TransparentUpgradeableProxy", config.genericHandler, deployer) as TransparentUpgradeableProxy;
      await genericHandler.changeAdmin(admin);
    }
  );
/**
npx hardhat deploy-proxy-all \
--domain 1 \
--rpc https://rpctest.meter.io \
--proxyadmin 0x123.....890 \
--bridgeadmin 0x098.....321
 */
task("deploy-proxy-all", "deploy all contract with proxy")
  .addParam("domain", "domain id", "0")
  .addParam("rpc", "rpc connect")
  .addParam("proxyadmin", "proxy admin private key")
  .addParam("bridgeadmin", "bridge admin private key")
  .setAction(
    async ({ domain, rpc, proxyadmin, bridgeadmin }, { ethers, run }) => {
      await run("compile");
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);
      const adminWallet = new ethers.Wallet(bridgeadmin, provider);

      const proxy_factory = await ethers.getContractFactory("TransparentUpgradeableProxy", proxyWallet);
      // Bridge contract
      const bridgeImpl = await (
        await (
          await ethers.getContractFactory("BridgeUpgradeable", proxyWallet)
        ).deploy()
      ).deployed();
      console.log("bridge Impl:", bridgeImpl.address);
      // Bridge Proxy
      const bridgeProxy = await (
        await proxy_factory.deploy(
          bridgeImpl.address,
          proxyWallet.address,
          bridgeImpl.interface.encodeFunctionData("initialize", [domain, [], 1, 999999, adminWallet.address])
        )
      ).deployed();
      console.log("bridge Proxy:", bridgeProxy.address);
      // erc20Handler contract
      const erc20HandlerImpl = await (
        await (
          await ethers.getContractFactory("ERC20HandlerUpgradeable", proxyWallet)
        ).deploy()
      ).deployed();
      console.log("erc20Handler Impl:", erc20HandlerImpl.address);
      // erc20Handler Proxy
      const erc20HandlerProxy = await (
        await proxy_factory.deploy(
          erc20HandlerImpl.address,
          proxyWallet.address,
          erc20HandlerImpl.interface.encodeFunctionData("initialize", [bridgeProxy.address])
        )
      ).deployed();
      console.log("erc20Handler Proxy:", erc20HandlerProxy.address);
      // erc721Handler contract
      const erc721HandlerImpl = await (
        await (
          await ethers.getContractFactory("ERC721HandlerUpgradeable", proxyWallet)
        ).deploy()
      ).deployed();
      console.log("erc721Handler Impl:", erc721HandlerImpl.address);
      // erc721Handler Proxy
      const erc721HandlerProxy = await (
        await proxy_factory.deploy(
          erc721HandlerImpl.address,
          proxyWallet.address,
          erc721HandlerImpl.interface.encodeFunctionData("initialize", [bridgeProxy.address])
        )
      ).deployed();
      console.log("erc721Handler Proxy:", erc721HandlerProxy.address);
      // erc1155Handler contract
      const erc1155HandlerImpl = await (
        await (
          await ethers.getContractFactory("ERC1155HandlerUpgradeable", proxyWallet)
        ).deploy()
      ).deployed();
      console.log("erc1155Handler Impl:", erc1155HandlerImpl.address);
      // erc1155Handler Proxy
      const erc1155HandlerProxy = await (
        await proxy_factory.deploy(
          erc1155HandlerImpl.address,
          proxyWallet.address,
          erc1155HandlerImpl.interface.encodeFunctionData("initialize", [bridgeProxy.address])
        )
      ).deployed();
      console.log("erc1155Handler Proxy:", erc1155HandlerProxy.address);
      // genericHandler contract
      const genericHandlerImpl = await (
        await (
          await ethers.getContractFactory("GenericHandlerUpgradeable", proxyWallet)
        ).deploy()
      ).deployed();
      console.log("genericHandler Impl:", genericHandlerImpl.address);
      // genericHandler Proxy
      const genericHandlerProxy = await (
        await proxy_factory.deploy(
          genericHandlerImpl.address,
          proxyWallet.address,
          genericHandlerImpl.interface.encodeFunctionData("initialize", [bridgeProxy.address])
        )
      ).deployed();
      console.log("genericHandler Proxy:", genericHandlerProxy.address);

    }
  );

/**
npx hardhat add-proxy-relayer \
--bridge 0x7FeD332D165e8FcCE15E7eC6A4D4A51edF0dF515 \
--rpc https://rpctest.meter.io \
--bridgeadmin 0x123.....890
 */
task("add-proxy-relayer", "adminAddRelayer")
  .addParam("bridge", "bridge contract")
  .addParam("rpc", "rpc connect")
  .addParam("bridgeadmin", "bridge admin private key")
  .addParam("relayer", "relayer address")
  .setAction(
    async ({ bridge, relayer, rpc, bridgeadmin }, { ethers, run, network }) => {
      await run("compile");
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const adminWallet = new ethers.Wallet(bridgeadmin, provider);

      const bridgeInstant = await ethers.getContractAt("Bridge", bridge, adminWallet) as Bridge;
      let receipt = await bridgeInstant.adminAddRelayer(relayer)
      console.log("adminAddRelayer tx:", receipt.hash)
    }
  );

task("deploy-proxy", "deploy contract with proxy")
  .addParam("contract", "contract")
  .addOptionalParam("domain", "domain id", "0")
  .setAction(
    async ({ contract, domain }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0]
      const admin = signers[1]
      let config = loadConfig(network.name, true);

      if (contract == 'bridge') {
        domain = domain ? domain : config.id;
        if (domain) {
          const impl = await deployContract(
            "BridgeUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as BridgeUpgradeable;

          const proxy = await deployContract(
            "TransparentUpgradeableProxy",
            network.name,
            ethers.getContractFactory,
            deployer,
            [
              impl.address,
              deployer.address,
              impl.interface.encodeFunctionData("initialize", [domain, [], 1, 999999, admin.address])
            ]
          ) as TransparentUpgradeableProxy;

          if (allowVerifyChain.indexOf(network.name) > -1) {
            await run("verify:verify", {
              address: proxy.address,
              constructorArguments: [
                impl.address,
                deployer.address,
                impl.interface.encodeFunctionData("initialize", [domain, [], 1, 999999, admin.address])
              ]
            });
          }
          config.bridge = proxy.address;
          config.name = network.name;
          config.type = "evm";
          config.from = deployer.address;
          config.id = domain;
        }
      } else if (contract == "erc20Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const impl = await deployContract(
            "ERC20HandlerUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as ERC20HandlerUpgradeable;

          const proxy = await deployContract(
            "TransparentUpgradeableProxy",
            network.name,
            ethers.getContractFactory,
            deployer,
            [
              impl.address,
              deployer.address,
              impl.interface.encodeFunctionData("initialize", [bridgeAddress])]
          ) as TransparentUpgradeableProxy;

          if (allowVerifyChain.indexOf(network.name) > -1) {
            await run("verify:verify", {
              address: proxy.address,
              constructorArguments: [bridgeAddress]
            });
          }
          config.erc20Handler = proxy.address;
        }
      } else if (contract == "erc721Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const impl = await deployContract(
            "ERC721HandlerUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as ERC721HandlerUpgradeable;

          const proxy = await deployContract(
            "TransparentUpgradeableProxy",
            network.name,
            ethers.getContractFactory,
            deployer,
            [
              impl.address,
              deployer.address,
              impl.interface.encodeFunctionData("initialize", [bridgeAddress])]
          ) as TransparentUpgradeableProxy;

          if (allowVerifyChain.indexOf(network.name) > -1) {
            await run("verify:verify", {
              address: proxy.address,
              constructorArguments: [bridgeAddress]
            });
          }
          config.erc721Handler = proxy.address;
        }
      } else if (contract == "erc1155Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const impl = await deployContract(
            "ERC1155HandlerUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as ERC1155HandlerUpgradeable;

          const proxy = await deployContract(
            "TransparentUpgradeableProxy",
            network.name,
            ethers.getContractFactory,
            deployer,
            [
              impl.address,
              deployer.address,
              impl.interface.encodeFunctionData("initialize", [bridgeAddress])]
          ) as TransparentUpgradeableProxy;

          if (allowVerifyChain.indexOf(network.name) > -1) {
            await run("verify:verify", {
              address: proxy.address,
              constructorArguments: [bridgeAddress]
            });
          }
          config.erc1155Handler = proxy.address;
        }
      } else if (contract == "genericHandler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const impl = await deployContract(
            "GenericHandlerUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as GenericHandlerUpgradeable;

          const proxy = await deployContract(
            "TransparentUpgradeableProxy",
            network.name,
            ethers.getContractFactory,
            deployer,
            [
              impl.address,
              deployer.address,
              impl.interface.encodeFunctionData("initialize", [bridgeAddress])]
          ) as TransparentUpgradeableProxy;

          if (allowVerifyChain.indexOf(network.name) > -1) {
            await run("verify:verify", {
              address: proxy.address,
              constructorArguments: [bridgeAddress]
            });
          }
          config.genericHandler = proxy.address;
        }
      }
      saveConfig(network.name, config, true);
    }
  );

task("update-proxy-all", "deploy contract with proxy")
  .addParam("contract", "contract")
  .addParam("proxy", "proxy address")
  .addParam("rpc", "rpc connect")
  .addParam("proxyadmin", "proxy admin private key")
  .setAction(
    async ({ rpc, proxy, proxyadmin, contract }, { ethers, run, network }) => {
      await run("compile");
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);

      let implAddress = "";
      if (contract == 'bridge') {
        const impl = await deployContract(
          "BridgeUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        ) as BridgeUpgradeable;
        implAddress = impl.address;
      } else if (contract == "erc20Handler") {
        const impl = await deployContract(
          "ERC20HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        ) as ERC20HandlerUpgradeable;
        implAddress = impl.address;
      } else if (contract == "erc721Handler") {
        const impl = await deployContract(
          "ERC721HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        ) as ERC721HandlerUpgradeable;
        implAddress = impl.address;
      } else if (contract == "erc1155Handler") {
        const impl = await deployContract(
          "ERC1155HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        ) as ERC1155HandlerUpgradeable;
        implAddress = impl.address;
      } else if (contract == "genericHandler") {
        const impl = await deployContract(
          "GenericHandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        ) as GenericHandlerUpgradeable;
        implAddress = impl.address;
      }
      if (implAddress != "") {
        const proxyContract = await ethers.getContractAt("TransparentUpgradeableProxy", proxy, proxyWallet) as TransparentUpgradeableProxy;
        await proxyContract.upgradeTo(implAddress)
      }
    }
  );

task("update-proxy", "deploy contract with proxy")
  .addParam("contract", "contract")
  .setAction(
    async ({ contract }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      const proxyAdmin = signers[0];
      let config = loadConfig(network.name, true);

      if (contract == 'bridge') {
        const impl = await deployContract(
          "BridgeUpgradeable",
          network.name,
          ethers.getContractFactory,
          deployer
        ) as BridgeUpgradeable;
        const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.bridge, proxyAdmin) as TransparentUpgradeableProxy;
        await proxy.upgradeTo(impl.address);
      } else if (contract == "erc20Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const impl = await deployContract(
            "ERC20HandlerUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as ERC20HandlerUpgradeable;

          const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc20Handler, proxyAdmin) as TransparentUpgradeableProxy;
          await proxy.upgradeTo(impl.address)
        }
      } else if (contract == "erc721Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const impl = await deployContract(
            "ERC721HandlerUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as ERC721HandlerUpgradeable;

          const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc721Handler, proxyAdmin) as TransparentUpgradeableProxy;
          await proxy.upgradeTo(impl.address)
        }
      } else if (contract == "erc1155Handler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const impl = await deployContract(
            "ERC1155HandlerUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as ERC1155HandlerUpgradeable;

          const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc1155Handler, proxyAdmin) as TransparentUpgradeableProxy;
          await proxy.upgradeTo(impl.address)
        }
      } else if (contract == "genericHandler") {
        const bridgeAddress = config.bridge;
        if (bridgeAddress != "") {
          const impl = await deployContract(
            "GenericHandlerUpgradeable",
            network.name,
            ethers.getContractFactory,
            deployer
          ) as GenericHandlerUpgradeable;

          const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.genericHandler, proxyAdmin) as TransparentUpgradeableProxy;
          await proxy.upgradeTo(impl.address)
        }
      }
    }
  );


task("deploy-sig-proxy", "deploy signature contract")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0]
      const admin = signers[1]
      let config = loadConfig(network.name, true);

      const impl = await deployContract(
        "SignaturesUpgradeable",
        network.name,
        ethers.getContractFactory,
        deployer
      ) as SignaturesUpgradeable;

      const proxy = await deployContract(
        "TransparentUpgradeableProxy",
        network.name,
        ethers.getContractFactory,
        deployer,
        [
          impl.address,
          deployer.address,
          impl.interface.encodeFunctionData("initialize", [admin.address])
        ]
      ) as TransparentUpgradeableProxy;
      config.signature = proxy.address;
      saveConfig(network.name, config, true);
    }
  );


task("update-signature", "deploy signature contract")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      await run("compile");
      const signers = await ethers.getSigners();
      const deployer = signers[0];
      const proxyAdmin = signers[1];
      let config = loadConfig(network.name, true);

      const instant = await deployContract(
        "SignaturesUpgradeable",
        network.name,
        ethers.getContractFactory,
        deployer
      ) as SignaturesUpgradeable;

      const proxy = await ethers.getContractAt(
        "TransparentUpgradeableProxy",
        config.signature,
        deployer
      ) as TransparentUpgradeableProxy;
      await proxy.upgradeTo(instant.address)
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

/**
npx hardhat deploy-proxy-token \
--name "token name" \
--symbol "SYMBOL" \
--decimals 18 \
--admin 0x1E4039Fb9761dA395788b6325D2790537e591937 \
--rpc https://rpctest.meter.io \
--proxyadmin 0xabc...def
 */
task("deploy-proxy-token", "deploy contract")
  .addParam("name", "token name", "")
  .addParam("symbol", "token symbol", "")
  .addParam("decimals", "token decimals", "18")
  .addParam("admin", "token owner address")
  .addParam("rpc", "rpc connect")
  .addParam("proxyadmin", "proxy admin private key")
  .setAction(
    async ({ name, symbol, decimals, rpc, proxyadmin, admin }, { ethers, run, network }) => {
      await run("compile");

      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);

      const proxy_factory = await ethers.getContractFactory("TransparentUpgradeableProxy", proxyWallet);
      // impl
      const impl = await (
        await (
          await ethers.getContractFactory("ERC20MintablePauseableUpgradeable", proxyWallet)
        ).deploy()
      ).deployed() as ERC20MintablePauseableUpgradeable;
      console.log("impl:", impl.address);

      const proxy = await (await proxy_factory.deploy(
        impl.address,
        proxyWallet.address,
        impl.interface.encodeFunctionData("initialize", [
          name,
          symbol,
          decimals,
          admin
        ])
      )).deployed();
      console.log("Proxy:", proxy.address);

    }
  );

task("update-proxy-token", "deploy contract")
  .addParam("token", "token proxy address", "")
  .addParam("rpc", "rpc connect")
  .addParam("proxyadmin", "proxy admin private key")
  .setAction(
    async ({ token, rpc, proxyadmin }, { ethers, run, network }) => {
      await run("compile");

      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);

      const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", token, proxyWallet) as TransparentUpgradeableProxy;
      // impl
      const impl = await (
        await (
          await ethers.getContractFactory("ERC20MintablePauseableUpgradeable", proxyWallet)
        ).deploy()
      ).deployed() as ERC20MintablePauseableUpgradeable;
      console.log("impl:", impl.address);

      let receipt = await proxy.upgradeTo(impl.address);
      console.log("upgradeTo Tx:", receipt.hash);

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
        const isNative = await erc20Handler.isNative(nativeAddress);

        if (!isNative) {
          let receipt = await bridgeInstant.adminSetNative(resid, nativeAddress, true);
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
      const isNative = await erc20Handler.isNative(nativeAddress);

      if (!isNative) {
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
      const deployer = signers[1];
      let config = loadConfig(network.name, true);
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

task("grantRole", "Grant Role")
  .addParam("address", "address")
  .setAction(
    async ({ address }, { ethers, run, network }) => {
      await run("compile");
      const [deployer, admin] = await ethers.getSigners();

      let config = loadConfig(network.name, true);

      const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, admin) as Bridge;

      let receipt = await bridgeInstant.grantRole(
        ethers.constants.HashZero,
        address
      );
      console.log("grantRole tx: ", receipt.hash)
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
      let config = loadConfig(network.name, true);

      let bridge = await ethers.getContractAt("Bridge", config.feeHandler, deployer) as Bridge;

      let receipt = await bridge.adminSetFee(fee);
      console.log(await receipt.wait())
      receipt = await bridge.adminSetSpecialFee(config.id, special);
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

task("sign-test", "get sign")
  .setAction(
    async ({ }, { ethers, run, network }) => {
      const [signer] = await ethers.getSigners();

      const name = "PermitBridge";
      const version = "1.0";

      const chainId = 3;
      const verifyingContract = "0x4eBc9d4Dd56278a4a8480a21f27CBA345668bdc4";

      const domainID = 5;
      const depositNonce = 22;
      const resourceID = "0x00000000000000000000008a419ef4941355476cf04933e90bf3bbf2f7381400";
      const data = "0x00000000000000000000000000000000000000000000000000194cb424068e000000000000000000000000000000000000000000000000000000000000000014551b6e92f7443e63ec2d0c43471de9574e834169";

      const domain = { name, version, chainId, verifyingContract };
      const types = {
        PermitBridge: [
          { name: "domainID", type: "uint8" },
          { name: "depositNonce", type: "uint64" },
          { name: "resourceID", type: "bytes32" },
          { name: "data", type: "bytes" }
        ],
      };
      const values = {
        domainID: domainID,
        depositNonce: depositNonce,
        resourceID: resourceID,
        data: data
      }
      const signature = await signer._signTypedData(domain, types, values);

      console.log("signature:", signature);

      const verify = utils.verifyTypedData(domain, types, values, signature);
      console.log("verify", verify);
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
