import { task } from "hardhat/config";
import { loadConfig } from "../script/deployTool";
import { Bridge } from "../typechain";

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
