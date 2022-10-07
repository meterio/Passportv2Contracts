import { task } from "hardhat/config";
import { loadConfig, deployContract, Token, createResourceID, saveConfig } from "../script/deployTool";
import { TokenERC20 } from "../typechain";

task("deploy-token", "deploy contract")
    .addParam("name", "token name", "")
    .addParam("symbol", "token symbol", "")
    .addParam("amount", "token amount", "")
    .addParam("from", "from domain id", "")
    .setAction(
        async ({ name, symbol, amount, from }, { ethers, run, network }) => {
            await run("compile");
            const signers = await ethers.getSigners();
            const deployer = signers[0]
            let config = loadConfig(network.name);
            const instant = await deployContract(
                "TokenERC20",
                network.name,
                ethers.getContractFactory,
                deployer,
                [name, symbol, amount]
            ) as TokenERC20;
            let token: Token = {
                address: instant.address,
                decimals: 18,
                name: name,
                symbol: symbol,
                native: false,
                from: from,
                resourceId: createResourceID(instant.address, from),
            }
            config.tokens.push(token);
            saveConfig(network.name, config);
        }
    );