import { task } from "hardhat/config";
import { loadConfig } from "../script/deployTool";
import { Bridge } from "../typechain-types";

task("set-fee", "set fee")
  .addParam("fee", "fee")
  .addParam("special", "special")
  .setAction(async ({ fee, special }, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    let config = loadConfig(network.name, true);

    let bridge = (await ethers.getContractAt(
      "Bridge",
      config.bridge,
      deployer
    )) as Bridge;

    let receipt = await bridge.adminSetFee(fee);
    console.log(await receipt.wait());
    receipt = await bridge.adminSetSpecialFee(config.id, special);
    console.log(await receipt.wait());
  });
