import { task } from "hardhat/config";
import { TransparentUpgradeableProxy, ERC20MintablePauseableUpgradeable } from "../typechain";

task("update-proxy-token", "deploy contract")
    .addParam("token", "token proxy address", "")
    .addParam("rpc", "rpc connect")
    .addParam("proxyadmin", "proxy admin private key")
    .setAction(
        async ({ token, rpc, proxyadmin }, { ethers, run, network }) => {
            await run("compile");

            let provider = new ethers.providers.JsonRpcProvider(rpc);
            const proxyWallet = new ethers.Wallet(proxyadmin, provider);

            const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", token, proxyWallet) as TransparentUpgradeableProxy;
            // impl
            const impl = await (
                await (
                    await ethers.getContractFactory("ERC20MintablePauseableUpgradeable", proxyWallet)
                ).deploy()
            ).deployed() as ERC20MintablePauseableUpgradeable;
            console.log("impl:", impl.address);

            let receipt = await proxy.upgradeTo(impl.address);
            console.log("upgradeTo Tx:", receipt.hash);

        }
    );