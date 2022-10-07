import { task } from "hardhat/config";
import { loadConfig, createResourceID, deployContract, Token, MINTER_ROLE, saveConfig } from "../script/deployTool";
import { constants } from "ethers";
import { Bridge, ERC20Handler, TokenERC20 } from "../typechain";

task("deploy-native", "deploy and regist native")
    .addParam("from", "from domain id", "")
    .addParam("name", "token name", "")
    .addParam("symbol", "token symbol", "")
    .setAction(
        async ({ from, name, symbol }, { ethers, run, network }) => {
            await run("compile");
            const signers = await ethers.getSigners();
            const deployer = signers[0];
            let config = loadConfig(network.name);

            const bridgeInstant = await ethers.getContractAt("Bridge", config.bridge, deployer) as Bridge;
            const nativeAddress = "0x0000000000000000000000000000000000000001";
            const resid = createResourceID(nativeAddress, from);

            if (Number(from) == config.id) {
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

                let token: Token = {
                    address: nativeAddress,
                    decimals: 18,
                    name: name,
                    symbol: symbol,
                    native: true,
                    from: from,
                    resourceId: resid,
                }
                config.tokens.push(token);
            } else {
                const tokenInstant = await deployContract(
                    "TokenERC20",
                    network.name,
                    ethers.getContractFactory,
                    deployer,
                    [name, symbol, 0]
                ) as TokenERC20;
                let token: Token = {
                    address: tokenInstant.address,
                    decimals: 18,
                    name: name,
                    symbol: symbol,
                    native: false,
                    from: from,
                    resourceId: resid,
                }
                config.tokens.push(token);
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
                const erc20HandlerInstant = await ethers.getContractAt("ERC20Handler", config.erc20Handler, deployer) as ERC20Handler;
                let burnList = await erc20HandlerInstant._burnList(token.address);
                if (!burnList) {
                    let receipt = await bridgeInstant.adminSetBurnable(
                        config.erc20Handler,
                        token.address
                    )
                    console.log(await receipt.wait())
                }
                let hasRole = await tokenInstant.hasRole(MINTER_ROLE, config.erc20Handler);
                if (!hasRole) {
                    let receipt = await tokenInstant.grantRole(
                        MINTER_ROLE,
                        config.erc20Handler
                    )
                    console.log(await receipt.wait())
                }
            }
            saveConfig(network.name, config);
        }
    );
