import { task } from "hardhat/config";
import { readFileSync } from "fs";
import { Bridge, ERC20Handler, TokenERC20 } from "../typechain";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// npx hardhat bridge-resource-scan --bridge 0xce785e92bc448de7c58d3f7d74f2bdced9cc7c49 --network metertest
task("bridge-resource-scan", "bridge resourceId scan")
    .addParam("bridge", "bridge address")
    .setAction(
        async ({ bridge }, hre) => {
            const resourceId_file = "./resourceId.txt";
            const resourceIds = readFileSync(resourceId_file).toString().split("\n");
            console.log("Scan resouceIds from file", resourceId_file, "...");
            console.log();
            const bridgeContract = await hre.ethers.getContractAt("Bridge", bridge) as Bridge;
            for (var id in resourceIds) {
                await parseHandleResouceId(hre, resourceIds[id], bridgeContract);
            }
        }
    );


const parseHandleResouceId = async (hre: HardhatRuntimeEnvironment, resourceId: string, bridge: Bridge) => {
    if (resourceId.length <= 0) {
        return;
    };
    resourceId = resourceId.trim();
    let erc20_name = "Native";
    let erc20_symbol = "Native Token";
    let erc20_decimals = 18;

    const handler_address = await bridge._resourceIDToHandlerAddress(resourceId);
    if (handler_address == "0x0000000000000000000000000000000000000000") {
        console.log("###### resouceId: ", resourceId, "Could not find the resourceId ...");
        return;
    }
    const handler_contract = await hre.ethers.getContractAt("ERC20Handler", handler_address) as ERC20Handler;

    const erc20_address = await handler_contract._resourceIDToTokenContractAddress(resourceId);

    const erc20_burnable = await handler_contract._burnList(erc20_address);
    const isNative = await handler_contract.isNative(erc20_address);

    if (!isNative) {
        const erc20_contract = await hre.ethers.getContractAt("TokenERC20", erc20_address) as TokenERC20;
        erc20_name = await erc20_contract.name();
        erc20_symbol = await erc20_contract.symbol();
        erc20_decimals = await erc20_contract.decimals();
    }

    // now print out
    console.log("###### resouceId: ", resourceId);
    console.log("   handler adress :", handler_address);
    console.log("   token address:", erc20_address, ", name:", erc20_name, ", symbol:", erc20_symbol, ", decimals:", erc20_decimals, ", burnable:", erc20_burnable, ", native:", isNative);
}
