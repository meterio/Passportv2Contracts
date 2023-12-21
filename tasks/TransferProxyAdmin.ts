import { task } from "hardhat/config";
import { loadConfig } from "../script/deployTool";
import { TransparentUpgradeableProxy } from "../typechain-types";

/**
npx hardhat transfer-proxy-admin \
--admin <admin address>
--network <network>
 */
task("transfer-proxy-admin", "transfer proxy admin")
  .addParam("admin", "admin address")
  .setAction(async ({ admin }, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    let config = loadConfig(network.name, true);

    const bridge = (await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      config.bridge,
      deployer
    )) as TransparentUpgradeableProxy;
    await bridge.changeAdmin(admin);

    const erc20Handler = (await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      config.erc20Handler,
      deployer
    )) as TransparentUpgradeableProxy;
    await erc20Handler.changeAdmin(admin);

    const erc721Handler = (await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      config.erc721Handler,
      deployer
    )) as TransparentUpgradeableProxy;
    await erc721Handler.changeAdmin(admin);

    const erc1155Handler = (await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      config.erc1155Handler,
      deployer
    )) as TransparentUpgradeableProxy;
    await erc1155Handler.changeAdmin(admin);

    const genericHandler = (await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      config.genericHandler,
      deployer
    )) as TransparentUpgradeableProxy;
    await genericHandler.changeAdmin(admin);
  });
