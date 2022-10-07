import { task } from "hardhat/config";
import { loadConfig } from "../script/deployTool";
import { Bridge } from "../typechain";

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

