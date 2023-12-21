import { task } from "hardhat/config";
import { loadConfig, deployContract } from "../script/deployTool";
import {
  SignaturesUpgradeable,
  TransparentUpgradeableProxy,
} from "../typechain-types";

/**
npx hardhat update-signature
 */
task("update-signature", "update signature contract").setAction(
  async ({}, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const proxyAdmin = signers[1];
    let config = loadConfig(network.name, true);

    const instant = (await deployContract(
      "SignaturesUpgradeable",
      network.name,
      ethers.getContractFactory,
      deployer
    )) as SignaturesUpgradeable;

    const proxy = (await ethers.getContractAt(
      "TransparentUpgradeableProxy",
      config.signature,
      deployer
    )) as TransparentUpgradeableProxy;
    await proxy.upgradeTo(instant.address);
  }
);
