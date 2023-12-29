import { BigNumber } from "ethers";
import { task } from "hardhat/config";
import { TransparentUpgradeableProxy } from "../typechain-types";
import { types } from "hardhat/config";

/*
npx hardhat transfer-proxy-admin-pk \
--proxy <proxy address> \
--newadmin <new admin address> \
--rpc https://rpctest.meter.io \
--proxyadmin <private key> \
--gasprice 1000000000
 */
task("transfer-proxy-admin-pk", "transfer proxy admin")
  .addParam("proxy", "proxy address")
  .addParam("newadmin", "new admin address")
  .addParam("rpc", "rpc connect")
  .addParam("proxyadmin", "proxy admin private key")
  .addOptionalParam("gasprice", "gas price", 0, types.int)
  .addOptionalParam("gaslimit", "gas limit", 200000, types.int)
  .setAction(
    async (
      { proxy, newadmin, rpc, proxyadmin, gasprice, gaslimit },
      { ethers, run, network }
    ) => {
      await run("compile");
      let override: { gasPrice?: number; gasLimit?: BigNumber } = {};

      if (gasprice > 0) {
        override.gasPrice = gasprice;
      }
      if (gaslimit > 0) {
        override = {
          ...override,
          gasLimit: BigNumber.from(gaslimit),
        };
      }
      console.log("override: ", override);
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);
      const proxy_contract = (await ethers.getContractAt(
        "TransparentUpgradeableProxy",
        proxy,
        proxyWallet
      )) as TransparentUpgradeableProxy;
      let receipt = await proxy_contract.changeAdmin(newadmin, override);
      console.log("changeAdmin:", receipt.hash);
    }
  );
