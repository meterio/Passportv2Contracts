import { task } from "hardhat/config";
import { loadConfig, deployContract, saveConfig } from "../script/deployTool";
import {
  SignaturesUpgradeable,
  TransparentUpgradeableProxy,
} from "../typechain-types";

/**
npx hardhat deploy-sig-proxy
 */
task("deploy-sig-proxy", "deploy signature contract").setAction(
  async ({}, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const admin = signers[1];
    let config = loadConfig(network.name, true);

    const impl = (await deployContract(
      "SignaturesUpgradeable",
      network.name,
      ethers.getContractFactory,
      deployer
    )) as SignaturesUpgradeable;

    const proxy = (await deployContract(
      "TransparentUpgradeableProxy",
      network.name,
      ethers.getContractFactory,
      deployer,
      [
        impl.address,
        deployer.address,
        impl.interface.encodeFunctionData("initialize", [admin.address]),
      ]
    )) as TransparentUpgradeableProxy;
    config.signature = proxy.address;
    saveConfig(network.name, config, true);
  }
);
