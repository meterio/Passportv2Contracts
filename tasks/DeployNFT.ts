import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import {
  loadConfig,
  deployContract,
  Token,
  createResourceID,
  saveConfig,
} from "../script/deployTool";
import { ERC721MinterBurnerPauser } from "../typechain-types";

task("deploy-nft", "deploy contract")
  .addParam("name", "token name", "")
  .addParam("symbol", "token symbol", "")
  .setAction(async ({ name, symbol }, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const instant = (await deployContract(
      "ERC721MinterBurnerPauser",
      network.name,
      ethers.getContractFactory,
      deployer,
      [name, symbol, ""]
    )) as ERC721MinterBurnerPauser;
    for (let i = 0; i < 10; i++) {
      let receipt = await instant.mint(deployer.address, BigNumber.from(i), "");
      console.log("mint tx:", receipt.hash);
    }
  });
