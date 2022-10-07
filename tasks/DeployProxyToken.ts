import { task } from "hardhat/config";
import { ERC20MintablePauseableUpgradeable } from "../typechain";

/**
npx hardhat deploy-proxy-token \
--name "token name" \
--symbol "SYMBOL" \
--decimals 18 \
--admin 0x1E4039Fb9761dA395788b6325D2790537e591937 \
--rpc https://rpctest.meter.io \
--proxyadmin 0xabc...def
 */
task("deploy-proxy-token", "deploy contract")
    .addParam("name", "token name", "")
    .addParam("symbol", "token symbol", "")
    .addParam("decimals", "token decimals", "18")
    .addParam("admin", "token owner address")
    .addParam("rpc", "rpc connect")
    .addParam("proxyadmin", "proxy admin private key")
    .setAction(
        async ({ name, symbol, decimals, rpc, proxyadmin, admin }, { ethers, run, network }) => {
            await run("compile");

            let provider = new ethers.providers.JsonRpcProvider(rpc);
            const proxyWallet = new ethers.Wallet(proxyadmin, provider);

            const proxy_factory = await ethers.getContractFactory("TransparentUpgradeableProxy", proxyWallet);
            // impl
            const impl = await (
                await (
                    await ethers.getContractFactory("ERC20MintablePauseableUpgradeable", proxyWallet)
                ).deploy()
            ).deployed() as ERC20MintablePauseableUpgradeable;
            console.log("impl:", impl.address);

            const proxy = await (await proxy_factory.deploy(
                impl.address,
                proxyWallet.address,
                impl.interface.encodeFunctionData("initialize", [
                    name,
                    symbol,
                    decimals,
                    admin
                ])
            )).deployed();
            console.log("Proxy:", proxy.address);

        }
    );
