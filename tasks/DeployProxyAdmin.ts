import { task } from "hardhat/config";
import { ProxyAdmin } from "../typechain";

/*
npx hardhat deploy-proxy-admin \
--rpc https://rpctest.meter.io \
--pk <private key>
--gasprice 1000000000
 */
task("deploy-proxy-admin", "transfer proxy admin")
    .addParam("rpc", "rpc connect")
    .addParam("pk", "admin private key")
    .addParam("gasprice", "gas price")
    .setAction(
        async ({ rpc, pk, gasprice }, { ethers, run, network }) => {
            await run("compile");
            let provider = new ethers.providers.JsonRpcProvider(rpc);
            const adminWallet = new ethers.Wallet(pk, provider);
            const contract = await (
                await (
                    await ethers.getContractFactory("ProxyAdmin", adminWallet)
                ).deploy({
                    gasPrice: gasprice
                })
            ).deployed() as ProxyAdmin;
            console.log("ProxyAdmin:", contract.address);

        }
    );