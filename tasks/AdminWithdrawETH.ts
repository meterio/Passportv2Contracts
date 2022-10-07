import { task } from "hardhat/config";
import { loadConfig } from "../script/deployTool";
import { Bridge } from "../typechain";

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