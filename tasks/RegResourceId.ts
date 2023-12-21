import { task } from "hardhat/config";
import { loadConfig } from "../script/deployTool";
import { constants } from "ethers";
import { Bridge, ERC20Handler } from "../typechain-types";

task("regresid", "get resource ID").setAction(
  async ({}, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    let config = loadConfig(network.name);
    let tokens = config.tokens;

    const bridgeInstant = (await ethers.getContractAt(
      "Bridge",
      config.bridge,
      deployer
    )) as Bridge;
    const erc20HandlerInstant = (await ethers.getContractAt(
      "ERC20Handler",
      config.erc20Handler,
      deployer
    )) as ERC20Handler;
    for (let i = 0; i < tokens.length; i++) {
      let resid = await erc20HandlerInstant._tokenContractAddressToResourceID(
        tokens[i].address
      );
      if (resid == constants.HashZero) {
        let receipt = await bridgeInstant.adminSetResource(
          config.erc20Handler,
          tokens[i].resourceId,
          tokens[i].address,
          false
        );
        console.log(await receipt.wait());
      } else {
        console.log("resid:", resid);
        console.log(
          "whitelisted:",
          await erc20HandlerInstant._contractWhitelist(tokens[i].address)
        );
        console.log(
          "_burnList:",
          await erc20HandlerInstant._burnList(tokens[i].address)
        );
        console.log(
          "token:",
          await erc20HandlerInstant._resourceIDToTokenContractAddress(resid)
        );
        console.log(
          "_resourceIDToHandlerAddress:",
          await bridgeInstant._resourceIDToHandlerAddress(resid)
        );
      }
    }
  }
);
