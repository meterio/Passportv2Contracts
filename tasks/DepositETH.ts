import { task } from "hardhat/config";
import { loadConfig, expandDecimals, encodeData } from "../script/deployTool";
import { Bridge } from "../typechain";
import { constants } from "ethers";

task("deposit-eth", "faucet")
    .addParam("amount", "amount")
    .addParam("to", "to")
    .setAction(
        async ({ to, amount }, { ethers, run, network }) => {
            await run("compile");
            const signers = await ethers.getSigners();
            const minter = signers[4];
            let config = loadConfig(network.name);
            const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, minter) as Bridge;
            const token = config.tokens[0];

            const data = encodeData(amount, minter.address);
            const fee = await bridgeInstant.calculateFee(
                to,
                token.resourceId,
                data,
                constants.HashZero
            )

            console.log({
                to: to, resid: token.resourceId, data: data, fee: fee.toString(), override: { value: expandDecimals(amount).add(fee) }
            })
            let receipt = await bridgeInstant.deposit(to, token.resourceId, data, constants.HashZero, { value: expandDecimals(amount).add(fee) })
            console.log(await receipt.wait())

        });