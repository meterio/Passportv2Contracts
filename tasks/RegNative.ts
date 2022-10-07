import { task } from "hardhat/config";
import { loadConfig, createResourceID } from "../script/deployTool";
import { constants } from "ethers";
import { Bridge, ERC20Handler } from "../typechain";


task("reg-native", "regist native")
    .setAction(
        async ({ }, { ethers, run, network }) => {
            await run("compile");
            const signers = await ethers.getSigners();
            const deployer = signers[0];
            let config = loadConfig(network.name);

            const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
            const nativeAddress = "0x0000000000000000000000000000000000000001";
            const resid = createResourceID(nativeAddress, config.id);

            let handlerAddress = await bridgeInstant._resourceIDToHandlerAddress(resid);

            if (handlerAddress == constants.AddressZero) {
                let receipt = await bridgeInstant.adminSetResource(
                    config.erc20Handler,
                    resid,
                    nativeAddress,
                    true
                )
                handlerAddress = config.erc20Handler;
                console.log(await receipt.wait())
            } else {
                console.log("handlerAddress:", handlerAddress)
            }
            const erc20Handler = await ethers.getContractAt("ERC20Handler", config.erc20Handler, deployer) as ERC20Handler;
            const isNative = await erc20Handler.isNative(nativeAddress);

            if (!isNative) {
                let receipt = await bridgeInstant.adminSetWtoken(resid, nativeAddress, true);
                console.log(await receipt.wait())
            }
        }
    );
