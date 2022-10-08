import { task } from "hardhat/config";
import { loadConfig, deployContract, saveConfig, allowVerifyChain } from "../script/deployTool";
import {
  BridgeUpgradeable,
  ERC20HandlerUpgradeable,
  ERC721HandlerUpgradeable,
  ERC1155HandlerUpgradeable,
  GenericHandlerUpgradeable,
  TransparentUpgradeableProxy
} from "../typechain";

/**
npx hardhat deploy-proxy-all \
--domain 1 \
--contract <contract name:bridge|erc20Handler|erc721Handler|erc1155Handler|genericHandler>
 */
task("deploy-proxy-all", "deploy contract with proxy")
  .addParam("contract", "contract")
  .addParam("domain", "domain id", "0")
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
