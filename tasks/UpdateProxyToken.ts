import { task } from "hardhat/config";
import { TransparentUpgradeableProxy, ERC20MintablePauseableUpgradeable } from "../typechain";
import { BigNumber } from "ethers";
/*
npx hardhat update-proxy-token \
--token <Token proxy address> \
--rpc https://rpctest.meter.io \
--proxyadmin <private key> \
--gasprice 1000000000
 */
task("update-proxy-token", "deploy contract")
    .addParam("token", "token proxy address", "")
    .addParam("rpc", "rpc connect")
    .addParam("proxyadmin", "proxy admin private key")
    .addOptionalParam("gasprice", "gas price", 0)
    .setAction(
        async ({ token, rpc, proxyadmin, gasprice }, { ethers, run, network }) => {
            await run("compile");

            let override = {}
            if (gasprice > 0) {
                override = {
                    gasLimit: BigNumber.from(200000),
                    gasPrice: gasprice
                }
            } else {
                override = {
                    gasLimit: BigNumber.from(200000)
                }
            }
            let provider = new ethers.providers.JsonRpcProvider(rpc);
            const proxyWallet = new ethers.Wallet(proxyadmin, provider);

            const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", token, proxyWallet) as TransparentUpgradeableProxy;
            // impl
            const impl = await (
                await (
                    await ethers.getContractFactory("ERC20MintablePauseableUpgradeable", proxyWallet)
                ).deploy(override)
            ).deployed() as ERC20MintablePauseableUpgradeable;
            console.log("impl:", impl.address);

            let receipt = await proxy.upgradeTo(impl.address, override);
            console.log("upgradeTo Tx:", receipt.hash);

        }
    );