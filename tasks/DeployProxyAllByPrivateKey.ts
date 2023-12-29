import { task } from "hardhat/config";
import { types } from "hardhat/config";
import { BridgeUpgradeable__factory } from "../typechain-types";

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
    async (
      { domain, expiry, rpc, proxyadmin, bridgeadmin, gasprice },
      { ethers, run }
    ) => {
      await run("compile");
      let provider = new ethers.providers.JsonRpcProvider(rpc);
      const proxyWallet = new ethers.Wallet(proxyadmin, provider);
      const adminWallet = new ethers.Wallet(bridgeadmin, provider);
      console.log("proxyWallet:", proxyWallet.address);
      console.log("adminWallet:", adminWallet.address);

      let override = {};
      if (gasprice > 0) {
        override = {
          gasPrice: gasprice,
        };
      }
      const proxy_factory = await ethers.getContractFactory(
        "TransparentUpgradeableProxy",
        proxyWallet
      );

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
          bridgeImpl.interface.encodeFunctionData("initialize", [
            domain,
            [],
            1,
            expiry,
            adminWallet.address,
          ]),
          override
        )
      ).deployed();
      console.log("bridge Proxy:", bridgeProxy.address);
      // erc20Handler contract
      const erc20HandlerImpl = await (
        await (
          await ethers.getContractFactory(
            "ERC20HandlerUpgradeable",
            proxyWallet
          )
        ).deploy(override)
      ).deployed();
      console.log("erc20Handler Impl:", erc20HandlerImpl.address);
      // erc20Handler Proxy
      const erc20HandlerProxy = await (
        await proxy_factory.deploy(
          erc20HandlerImpl.address,
          proxyWallet.address,
          erc20HandlerImpl.interface.encodeFunctionData("initialize", [
            bridgeProxy.address,
          ]),
          override
        )
      ).deployed();
      console.log("erc20Handler Proxy:", erc20HandlerProxy.address);
      // erc721Handler contract
      const erc721HandlerImpl = await (
        await (
          await ethers.getContractFactory(
            "ERC721HandlerUpgradeable",
            proxyWallet
          )
        ).deploy(override)
      ).deployed();
      console.log("erc721Handler Impl:", erc721HandlerImpl.address);
      // erc721Handler Proxy
      const erc721HandlerProxy = await (
        await proxy_factory.deploy(
          erc721HandlerImpl.address,
          proxyWallet.address,
          erc721HandlerImpl.interface.encodeFunctionData("initialize", [
            bridgeProxy.address,
          ]),
          override
        )
      ).deployed();
      console.log("erc721Handler Proxy:", erc721HandlerProxy.address);
      // erc1155Handler contract
      const erc1155HandlerImpl = await (
        await (
          await ethers.getContractFactory(
            "ERC1155HandlerUpgradeable",
            proxyWallet
          )
        ).deploy(override)
      ).deployed();
      console.log("erc1155Handler Impl:", erc1155HandlerImpl.address);
      // erc1155Handler Proxy
      const erc1155HandlerProxy = await (
        await proxy_factory.deploy(
          erc1155HandlerImpl.address,
          proxyWallet.address,
          erc1155HandlerImpl.interface.encodeFunctionData("initialize", [
            bridgeProxy.address,
          ]),
          override
        )
      ).deployed();
      console.log("erc1155Handler Proxy:", erc1155HandlerProxy.address);
      // genericHandler contract
      const genericHandlerImpl = await (
        await (
          await ethers.getContractFactory(
            "GenericHandlerUpgradeable",
            proxyWallet
          )
        ).deploy(override)
      ).deployed();
      console.log("genericHandler Impl:", genericHandlerImpl.address);
      // genericHandler Proxy
      const genericHandlerProxy = await (
        await proxy_factory.deploy(
          genericHandlerImpl.address,
          proxyWallet.address,
          genericHandlerImpl.interface.encodeFunctionData("initialize", [
            bridgeProxy.address,
          ]),
          override
        )
      ).deployed();
      console.log("genericHandler Proxy:", genericHandlerProxy.address);
    }
  );

/**
npx hardhat deploy-proxy-all-pk \
--domain 1 \
--rpc https://rpctest.meter.io \
--proxyadmin 0x123.....890 \
--bridgeadmin 0x098.....321 \
--gasprice 1000000000
 */
task("verify-proxy-all", "verify all contracts").setAction(
  async ({ rpc }, { ethers, run }) => {
    await run("compile");
    let provider = new ethers.providers.JsonRpcProvider(rpc);

    const proxyAdmin = "0x8cafd0397e1b09199a1b1239030cc6b011ae696d";
    const bridgeAdmin = "0x5C85A7Ae2B6d29C38cdF360553F8aCBC4e684c31";
    const domain = 12;
    const expiry = 30000;

    const bridgeImplAddr = "0x890143505a99d625c8f2775efFE800780DBCA640";
    const bridgeProxyAddr = "0x5Bc89e202f5aA0244746754ccDe3abf159f765f6";
    const erc20HandlerImplAddr = "0x085f02E24868D46b307436e36b92082840291256";
    const erc20HandlerProxyAddr = "0x195d3cAefa6495514eb19D4CA3e21d3299889D11";
    const erc721HandlerImplAddr = "0x5d75E588fEDd4A4F42a4d7708973feFD8c8870Cf";
    const erc721HandlerProxyAddr = "0x49BAFC6dADc816698B75294FC5Ea00c8D7Fc9509";
    const erc1155HandlerImplAddr = "0x9496E306D225662A0F8b92dE669E494299B644FE";
    const erc1155HandlerProxyAddr =
      "0x2aFc7879BcAA6a90B0429D1b388dd1959608AE62";
    const genericHandlerImplAddr = "0x7FbB4e3E9959d7C07626A00f061386f5A4F4736d";
    const genericHandlerProxyAddr =
      "0x93a884a6d5D66011322E8627e00543edE242aC81";

    const bridgeImpl = await ethers.getContractAt(
      "BridgeUpgradeable",
      bridgeImplAddr
    );
    // bridge impl
    await run("verify:verify", {
      address: bridgeImplAddr,
      contract: "contracts/BridgeUpgradeable.sol:BridgeUpgradeable",
      constructorArguments: [],
    });

    // bridge proxy
    await run("verify:verify", {
      address: bridgeProxyAddr,
      contract:
        "contracts/proxy/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
      constructorArguments: [
        bridgeImpl.address,
        proxyAdmin,
        bridgeImpl.interface.encodeFunctionData("initialize", [
          domain,
          [],
          1,
          expiry,
          bridgeAdmin,
        ]),
      ],
    });

    // erc20 handler impl
    await run("verify:verify", {
      address: erc20HandlerImplAddr,
      contract:
        "contracts/handlers/ERC20HandlerUpgradeable.sol:ERC20HandlerUpgradeable",
      constructorArguments: [],
    });
    const erc20HandlerImpl = await ethers.getContractAt(
      "ERC20HandlerUpgradeable",
      erc20HandlerImplAddr
    );
    const initializeData = erc20HandlerImpl.interface.encodeFunctionData(
      "initialize",
      [bridgeProxyAddr]
    );

    // erc20 handler proxy
    await run("verify:verify", {
      address: erc20HandlerProxyAddr,
      contract:
        "contracts/proxy/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
      constructorArguments: [erc20HandlerImplAddr, proxyAdmin, initializeData],
    });

    // erc721 handler impl
    await run("verify:verify", {
      address: erc721HandlerImplAddr,
      contract:
        "contracts/handlers/ERC721HandlerUpgradeable.sol:ERC721HandlerUpgradeable",
      constructorArguments: [],
    });
    await run("verify:verify", {
      address: erc721HandlerImplAddr,
      contract:
        "contracts/handlers/ERC721HandlerUpgradeable.sol:ERC721HandlerUpgradeable",
      constructorArguments: [],
    });

    // erc721 handler proxy
    await run("verify:verify", {
      address: erc721HandlerProxyAddr,
      contract:
        "contracts/proxy/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
      constructorArguments: [erc721HandlerImplAddr, proxyAdmin, initializeData],
    });

    // erc1155 handler impl
    await run("verify:verify", {
      address: erc1155HandlerImplAddr,
      contract:
        "contracts/handlers/ERC1155HandlerUpgradeable.sol:ERC1155HandlerUpgradeable",
      constructorArguments: [],
    });

    // erc1155 handler proxy
    await run("verify:verify", {
      address: erc1155HandlerProxyAddr,
      contract:
        "contracts/proxy/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
      constructorArguments: [
        erc1155HandlerImplAddr,
        proxyAdmin,
        initializeData,
      ],
    });

    // generic handler impl
    await run("verify:verify", {
      address: genericHandlerImplAddr,
      contract:
        "contracts/handlers/GenericHandlerUpgradeable.sol:GenericHandlerUpgradeable",
      constructorArguments: [],
    });

    // generic handler proxy
    await run("verify:verify", {
      address: genericHandlerProxyAddr,
      contract:
        "contracts/proxy/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy",
      constructorArguments: [
        genericHandlerImplAddr,
        proxyAdmin,
        initializeData,
      ],
    });
  }
);
