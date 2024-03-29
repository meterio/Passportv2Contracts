import { task } from "hardhat/config";
import { deployContract } from "../script/deployTool";
import { types } from "hardhat/config";
import {
  BridgeUpgradeable,
  ERC20HandlerUpgradeable,
  ERC721HandlerUpgradeable,
  ERC1155HandlerUpgradeable,
  GenericHandlerUpgradeable,
  TransparentUpgradeableProxy,
} from "../typechain-types";
import { BigNumber } from "ethers";

/**
npx hardhat update-proxy-pk \
--contract <bridge|erc20Handler|erc721Handler|erc1155Handler|genericHandler> \
--proxy <proxy contract address>
--rpc https://rpctest.meter.io \
--proxyadmin 0x123.....890 \
--gasprice 1000000000
 */
task("update-proxy-pk", "deploy contract with proxy")
  .addParam("contract", "contract")
  .addParam("proxy", "proxy address")
  .addParam("rpc", "rpc connect")
  .addParam("proxyadmin", "proxy admin private key")
  .addOptionalParam("gasprice", "gas price", 0, types.int)
  .setAction(
    async (
      { rpc, proxy, proxyadmin, contract, gasprice },
      { ethers, run, network }
    ) => {
      await run("compile");
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);

      let override = {};
      if (gasprice > 0) {
        override = {
          gasLimit: BigNumber.from(200000),
          gasPrice: gasprice,
        };
      } else {
        override = {
          gasLimit: BigNumber.from(200000),
        };
      }
      let implAddress = "";
      if (contract == "bridge") {
        const impl = (await deployContract(
          "BridgeUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        )) as BridgeUpgradeable;
        implAddress = impl.address;
      } else if (contract == "erc20Handler") {
        const impl = (await deployContract(
          "ERC20HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        )) as ERC20HandlerUpgradeable;
        implAddress = impl.address;
      } else if (contract == "erc721Handler") {
        const impl = (await deployContract(
          "ERC721HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        )) as ERC721HandlerUpgradeable;
        implAddress = impl.address;
      } else if (contract == "erc1155Handler") {
        const impl = (await deployContract(
          "ERC1155HandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        )) as ERC1155HandlerUpgradeable;
        implAddress = impl.address;
      } else if (contract == "genericHandler") {
        const impl = (await deployContract(
          "GenericHandlerUpgradeable",
          network.name,
          ethers.getContractFactory,
          proxyWallet
        )) as GenericHandlerUpgradeable;
        implAddress = impl.address;
      }
      if (implAddress != "") {
        const proxyContract = (await ethers.getContractAt(
          "TransparentUpgradeableProxy",
          proxy,
          proxyWallet
        )) as TransparentUpgradeableProxy;
        await proxyContract.upgradeTo(implAddress, override);
      }
    }
  );
