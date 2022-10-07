import { task } from "hardhat/config";
import { loadConfig, deployContract } from "../script/deployTool";
import {
    BridgeUpgradeable,
    ERC20HandlerUpgradeable,
    ERC721HandlerUpgradeable,
    ERC1155HandlerUpgradeable,
    GenericHandlerUpgradeable,
    TransparentUpgradeableProxy
} from "../typechain";

/**
npx hardhat update-proxy \
--contract <bridge|erc20Handler|erc721Handler|erc1155Handler|genericHandler> 
 */
task("update-proxy", "deploy contract with proxy")
    .addParam("contract", "contract")
    .setAction(
        async ({ contract }, { ethers, run, network }) => {
            await run("compile");
            const signers = await ethers.getSigners();
            const deployer = signers[0];
            const proxyAdmin = signers[0];
            let config = loadConfig(network.name, true);

            if (contract == 'bridge') {
                const impl = await deployContract(
                    "BridgeUpgradeable",
                    network.name,
                    ethers.getContractFactory,
                    deployer
                ) as BridgeUpgradeable;
                const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.bridge, proxyAdmin) as TransparentUpgradeableProxy;
                await proxy.upgradeTo(impl.address);
            } else if (contract == "erc20Handler") {
                const bridgeAddress = config.bridge;
                if (bridgeAddress != "") {
                    const impl = await deployContract(
                        "ERC20HandlerUpgradeable",
                        network.name,
                        ethers.getContractFactory,
                        deployer
                    ) as ERC20HandlerUpgradeable;

                    const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc20Handler, proxyAdmin) as TransparentUpgradeableProxy;
                    await proxy.upgradeTo(impl.address)
                }
            } else if (contract == "erc721Handler") {
                const bridgeAddress = config.bridge;
                if (bridgeAddress != "") {
                    const impl = await deployContract(
                        "ERC721HandlerUpgradeable",
                        network.name,
                        ethers.getContractFactory,
                        deployer
                    ) as ERC721HandlerUpgradeable;

                    const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc721Handler, proxyAdmin) as TransparentUpgradeableProxy;
                    await proxy.upgradeTo(impl.address)
                }
            } else if (contract == "erc1155Handler") {
                const bridgeAddress = config.bridge;
                if (bridgeAddress != "") {
                    const impl = await deployContract(
                        "ERC1155HandlerUpgradeable",
                        network.name,
                        ethers.getContractFactory,
                        deployer
                    ) as ERC1155HandlerUpgradeable;

                    const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.erc1155Handler, proxyAdmin) as TransparentUpgradeableProxy;
                    await proxy.upgradeTo(impl.address)
                }
            } else if (contract == "genericHandler") {
                const bridgeAddress = config.bridge;
                if (bridgeAddress != "") {
                    const impl = await deployContract(
                        "GenericHandlerUpgradeable",
                        network.name,
                        ethers.getContractFactory,
                        deployer
                    ) as GenericHandlerUpgradeable;

                    const proxy = await ethers.getContractAt("TransparentUpgradeableProxy", config.genericHandler, proxyAdmin) as TransparentUpgradeableProxy;
                    await proxy.upgradeTo(impl.address)
                }
            }
        }
    );
