import { task } from "hardhat/config";
import { loadConfig, expandDecimals, encodeData } from "../script/deployTool";
import { Bridge, TokenERC20 } from "../typechain-types";
import { constants } from "ethers";

task("deposit", "faucet")
  .addParam("amount", "amount")
  .addParam("to", "to")
  .setAction(async ({ to, amount }, { ethers, run, network }) => {
    await run("compile");
    const signers = await ethers.getSigners();
    const minter = signers[4];
    let config = loadConfig(network.name);
    const bridgeInstant = (await ethers.getContractAt(
      "Bridge",
      config.bridge,
      minter
    )) as Bridge;

    const token = config.tokens[1];
    const tokenInstant = (await ethers.getContractAt(
      "TokenERC20",
      token.address,
      minter
    )) as TokenERC20;
    const allowance = await tokenInstant.allowance(
      minter.address,
      config.erc20Handler
    );
    if (allowance.lt(expandDecimals(amount))) {
      let receipt = await tokenInstant.approve(
        config.erc20Handler,
        constants.MaxUint256
      );
      console.log(await receipt.wait());
    }

    const data = encodeData(amount, minter.address);
    const fee = await bridgeInstant.calculateFee(
      to,
      token.resourceId,
      data,
      constants.HashZero
    );

    console.log({
      to: to,
      resid: token.resourceId,
      data: data,
      fee: fee.toString(),
      override: { value: fee },
    });
    let receipt = await bridgeInstant.deposit(
      to,
      token.resourceId,
      data,
      constants.HashZero,
      { value: fee }
    );
    console.log(await receipt.wait());
  });
