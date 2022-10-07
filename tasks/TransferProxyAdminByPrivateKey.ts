import { task } from "hardhat/config";
import { TransparentUpgradeableProxy } from "../typechain"

/*
npx hardhat transfer-proxy-admin-pk \
--proxy <proxy address> \
--newadmin <new admin address> \
--rpc https://rpctest.meter.io \
--proxyadmin <private key>
 */
task("transfer-proxy-admin-pk", "transfer proxy admin")
    .addParam("proxy", "proxy address")
    .addParam("newadmin", "new admin address")
    .addParam("rpc", "rpc connect")
    .addParam("proxyadmin", "proxy admin private key")
    .setAction(
        async ({ proxy, newadmin, rpc, proxyadmin }, { ethers, run, network }) => {
            await run("compile");

            let provider = new ethers.providers.JsonRpcProvider(rpc);
            const proxyWallet = new ethers.Wallet(proxyadmin, provider);

            const proxy_contract = await ethers.getContractAt("TransparentUpgradeableProxy", proxy, proxyWallet) as TransparentUpgradeableProxy;
            await proxy_contract.changeAdmin(newadmin);
        }
    );