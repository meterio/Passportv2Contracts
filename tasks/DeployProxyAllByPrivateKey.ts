import { task } from "hardhat/config";
import { types } from "hardhat/config";

/**
npx hardhat deploy-proxy-all-pk \
--domain 1 \
--rpc https://rpctest.meter.io \
--proxyadmin 0x123.....890 \
--bridgeadmin 0x098.....321 \
--gasprice 1000000000
 */
task("deploy-proxy-all-pk", "deploy all contract with proxy")
  .addParam("domain", "domain id", "0")
  .addParam("expiry", "expiry", "30000")
  .addParam("rpc", "rpc connect")
  .addParam("proxyadmin", "proxy admin private key")
  .addParam("bridgeadmin", "bridge admin private key")
  .addOptionalParam("gasprice", "gas price", 0, types.int)
  .setAction(
    async ({ domain, expiry, rpc, proxyadmin, bridgeadmin, gasprice }, { ethers, run }) => {
      await run("compile");
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);
      const adminWallet = new ethers.Wallet(bridgeadmin, provider);
      console.log("proxyWallet:", proxyWallet.address);
      console.log("adminWallet:", adminWallet.address);

      let override = {}
      if (gasprice > 0) {
        override = {
          gasPrice: gasprice
        }
      }
      const proxy_factory = await ethers.getContractFactory("TransparentUpgradeableProxy", proxyWallet);
      // Bridge contract
      const bridgeImpl = await (
        await (
          await ethers.getContractFactory("BridgeUpgradeable", proxyWallet)
        ).deploy(override)
      ).deployed();
      console.log("bridge Impl:", bridgeImpl.address);
      // Bridge Proxy
      const bridgeProxy = await (
        await proxy_factory.deploy(
          bridgeImpl.address,
          proxyWallet.address,
          bridgeImpl.interface.encodeFunctionData("initialize", [domain, [], 1, expiry, adminWallet.address]),
          override
        )
      ).deployed();
      console.log("bridge Proxy:", bridgeProxy.address);
      // erc20Handler contract
      const erc20HandlerImpl = await (
        await (
          await ethers.getContractFactory("ERC20HandlerUpgradeable", proxyWallet)
        ).deploy(override)
      ).deployed();
      console.log("erc20Handler Impl:", erc20HandlerImpl.address);
      // erc20Handler Proxy
      const erc20HandlerProxy = await (
        await proxy_factory.deploy(
          erc20HandlerImpl.address,
          proxyWallet.address,
          erc20HandlerImpl.interface.encodeFunctionData("initialize", [bridgeProxy.address]),
          override
        )
      ).deployed();
      console.log("erc20Handler Proxy:", erc20HandlerProxy.address);
      // erc721Handler contract
      const erc721HandlerImpl = await (
        await (
          await ethers.getContractFactory("ERC721HandlerUpgradeable", proxyWallet)
        ).deploy(override)
      ).deployed();
      console.log("erc721Handler Impl:", erc721HandlerImpl.address);
      // erc721Handler Proxy
      const erc721HandlerProxy = await (
        await proxy_factory.deploy(
          erc721HandlerImpl.address,
          proxyWallet.address,
          erc721HandlerImpl.interface.encodeFunctionData("initialize", [bridgeProxy.address]),
          override
        )
      ).deployed();
      console.log("erc721Handler Proxy:", erc721HandlerProxy.address);
      // erc1155Handler contract
      const erc1155HandlerImpl = await (
        await (
          await ethers.getContractFactory("ERC1155HandlerUpgradeable", proxyWallet)
        ).deploy(override)
      ).deployed();
      console.log("erc1155Handler Impl:", erc1155HandlerImpl.address);
      // erc1155Handler Proxy
      const erc1155HandlerProxy = await (
        await proxy_factory.deploy(
          erc1155HandlerImpl.address,
          proxyWallet.address,
          erc1155HandlerImpl.interface.encodeFunctionData("initialize", [bridgeProxy.address]),
          override
        )
      ).deployed();
      console.log("erc1155Handler Proxy:", erc1155HandlerProxy.address);
      // genericHandler contract
      const genericHandlerImpl = await (
        await (
          await ethers.getContractFactory("GenericHandlerUpgradeable", proxyWallet)
        ).deploy(override)
      ).deployed();
      console.log("genericHandler Impl:", genericHandlerImpl.address);
      // genericHandler Proxy
      const genericHandlerProxy = await (
        await proxy_factory.deploy(
          genericHandlerImpl.address,
          proxyWallet.address,
          genericHandlerImpl.interface.encodeFunctionData("initialize", [bridgeProxy.address]),
          override
        )
      ).deployed();
      console.log("genericHandler Proxy:", genericHandlerProxy.address);

    }
  );
