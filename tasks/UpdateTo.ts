import { task } from "hardhat/config";
import { TransparentUpgradeableProxy } from "../typechain";

/**
npx hardhat update-to \
--impl  <implementation contract address> \
--proxy <proxy contract address>
--rpc https://rpctest.meter.io \
--proxyadmin 0x123.....890 \
--gasprice 1000000000
 */
task("update-to", "update proxy to new implementation")
  .addParam("impl", "implementation address")
  .addParam("proxy", "proxy address")
  .addParam("rpc", "rpc connect")
  .addParam("proxyadmin", "proxy admin private key")
  .addParam("gasprice", "gas price")
  .setAction(
    async ({ rpc, proxy, proxyadmin, impl, gasprice }, { ethers, run, network }) => {
      await run("compile");
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);

      const proxyContract = await ethers.getContractAt("TransparentUpgradeableProxy", proxy, proxyWallet) as TransparentUpgradeableProxy;
      await proxyContract.upgradeTo(impl, {
        gasPrice: gasprice
      })
    }
  );
