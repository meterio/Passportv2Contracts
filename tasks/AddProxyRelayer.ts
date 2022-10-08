import { task } from "hardhat/config";
import { Bridge } from "../typechain"

/**
npx hardhat add-proxy-relayer \
--bridge 0x7FeD332D165e8FcCE15E7eC6A4D4A51edF0dF515 \
--rpc https://rpctest.meter.io \
--bridgeadmin 0x123.....890 \
--gasprice 1000000000
 */
task("add-proxy-relayer", "adminAddRelayer")
    .addParam("bridge", "bridge contract")
    .addParam("rpc", "rpc connect")
    .addParam("bridgeadmin", "bridge admin private key")
    .addParam("relayer", "relayer address")
    .addOptionalParam("gasprice", "gas price", 0)
    .setAction(
        async ({ bridge, relayer, rpc, bridgeadmin, gasprice }, { ethers, run, network }) => {
            await run("compile");
            let provider = new ethers.providers.JsonRpcProvider(rpc);
            const adminWallet = new ethers.Wallet(bridgeadmin, provider);

            let override = {}
            if (gasprice > 0) {
                override = {
                    gasPrice: gasprice
                }
            }
            const bridgeInstant = await ethers.getContractAt("Bridge", bridge, adminWallet) as Bridge;
            let receipt = await bridgeInstant.adminAddRelayer(relayer, override)
            console.log("adminAddRelayer tx:", receipt.hash)
        }
    );
