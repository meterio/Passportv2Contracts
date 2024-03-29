import { task } from "hardhat/config";
import {
  loadConfig,
  deployContract,
  saveConfig,
  allowVerifyChain,
} from "../script/deployTool";
import {
  BridgeUpgradeable,
  ERC20HandlerUpgradeable,
  ERC721HandlerUpgradeable,
  ERC1155HandlerUpgradeable,
  GenericHandlerUpgradeable,
  TransparentUpgradeableProxy,
} from "../typechain-types";

/**
npx hardhat deploy-proxy-all \
--admin <admin address>
--domain 1 \
--contract <contract name:bridge|erc20Handler|erc721Handler|erc1155Handler|genericHandler>
 */
task("deploy-proxy-all", "deploy contract with proxy")
  .addParam("admin", "contract admin")
  .addParam("contract", "contract")
  .addParam("domain", "domain id", "0")
  .setAction(async ({ contract, domain, admin }, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    let config = loadConfig(network.name, true);
    console.log("deployer:", deployer.address);

    if (contract == "bridge" || contract == "all") {
      domain = domain ? domain : config.id;
      if (domain) {
        const impl = (await deployContract(
          "BridgeUpgradeable",
          network.name,
          ethers.getContractFactory,
          deployer
        )) as BridgeUpgradeable;

        const proxy = (await deployContract(
          "TransparentUpgradeableProxy",
          network.name,
          ethers.getContractFactory,
          deployer,
          [
            impl.address,
            deployer.address,
            impl.interface.encodeFunctionData("initialize", [
              domain,
              [],
              1,
              999999,
              admin,
            ]),
          ]
        )) as TransparentUpgradeableProxy;

        if (allowVerifyChain.indexOf(network.name) > -1) {
          await run("verify:verify", {
            address: proxy.address,
            constructorArguments: [
              impl.address,
              deployer.address,
              impl.interface.encodeFunctionData("initialize", [
                domain,
                [],
                1,
                999999,
                admin,
              ]),
            ],
          });
        }
        config.bridge = proxy.address;
        config.name = network.name;
        config.type = "evm";
        config.from = deployer.address;
        config.id = domain;
      }
    }
    if (contract == "erc20Handler" || contract == "all") {
      const bridgeAddress = config.bridge;
      if (bridgeAddress != "") {
        const impl = (await deployContract(
          "ERC20HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          deployer
        )) as ERC20HandlerUpgradeable;

        const proxy = (await deployContract(
          "TransparentUpgradeableProxy",
          network.name,
          ethers.getContractFactory,
          deployer,
          [
            impl.address,
            deployer.address,
            impl.interface.encodeFunctionData("initialize", [bridgeAddress]),
          ]
        )) as TransparentUpgradeableProxy;

        if (allowVerifyChain.indexOf(network.name) > -1) {
          await run("verify:verify", {
            address: proxy.address,
            constructorArguments: [bridgeAddress],
          });
        }
        config.erc20Handler = proxy.address;
      }
    }
    if (contract == "erc721Handler" || contract == "all") {
      const bridgeAddress = config.bridge;
      if (bridgeAddress != "") {
        const impl = (await deployContract(
          "ERC721HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          deployer
        )) as ERC721HandlerUpgradeable;

        const proxy = (await deployContract(
          "TransparentUpgradeableProxy",
          network.name,
          ethers.getContractFactory,
          deployer,
          [
            impl.address,
            deployer.address,
            impl.interface.encodeFunctionData("initialize", [bridgeAddress]),
          ]
        )) as TransparentUpgradeableProxy;

        if (allowVerifyChain.indexOf(network.name) > -1) {
          await run("verify:verify", {
            address: proxy.address,
            constructorArguments: [bridgeAddress],
          });
        }
        config.erc721Handler = proxy.address;
      }
    }
    if (contract == "erc1155Handler" || contract == "all") {
      const bridgeAddress = config.bridge;
      if (bridgeAddress != "") {
        const impl = (await deployContract(
          "ERC1155HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          deployer
        )) as ERC1155HandlerUpgradeable;

        const proxy = (await deployContract(
          "TransparentUpgradeableProxy",
          network.name,
          ethers.getContractFactory,
          deployer,
          [
            impl.address,
            deployer.address,
            impl.interface.encodeFunctionData("initialize", [bridgeAddress]),
          ]
        )) as TransparentUpgradeableProxy;

        if (allowVerifyChain.indexOf(network.name) > -1) {
          await run("verify:verify", {
            address: proxy.address,
            constructorArguments: [bridgeAddress],
          });
        }
        config.erc1155Handler = proxy.address;
      }
    }
    if (contract == "genericHandler" || contract == "all") {
      const bridgeAddress = config.bridge;
      if (bridgeAddress != "") {
        const impl = (await deployContract(
          "GenericHandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          deployer
        )) as GenericHandlerUpgradeable;

        const proxy = (await deployContract(
          "TransparentUpgradeableProxy",
          network.name,
          ethers.getContractFactory,
          deployer,
          [
            impl.address,
            deployer.address,
            impl.interface.encodeFunctionData("initialize", [bridgeAddress]),
          ]
        )) as TransparentUpgradeableProxy;

        if (allowVerifyChain.indexOf(network.name) > -1) {
          await run("verify:verify", {
            address: proxy.address,
            constructorArguments: [bridgeAddress],
          });
        }
        config.genericHandler = proxy.address;
      }
    }
    saveConfig(network.name, config, true);
  });
