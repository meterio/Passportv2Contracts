import { task } from "hardhat/config";
import { loadConfig, deployContract, saveConfig } from "../script/deployTool";

import {
    Bridge,
    ERC20Handler,
    ERC721Handler,
    ERC1155Handler,
    GenericHandler
} from "../typechain"
task("deploy", "deploy contract")
    .addParam("contract", "contract")
    .addOptionalParam("domain", "domain id", "0")
    .setAction(
        async ({ contract, domain }, { ethers, run, network }) => {
            await run("compile");
            const signers = await ethers.getSigners();
            const deployer = signers[0]
            let config = loadConfig(network.name);

            if (contract == 'bridge') {
                domain = domain ? domain : config.id;
                if (domain) {
                    const bridgeArgs = [
                        domain,
                        [],
                        2,
                        999999
                    ]
                    const instant = await deployContract(
                        "Bridge",
                        network.name,
                        ethers.getContractFactory,
                        deployer,
                        bridgeArgs
                    ) as Bridge;
                    config.bridge = instant.address;
                    config.name = network.name;
                    config.type = "evm";
                    config.from = deployer.address;
                    config.id = domain;
                }
            } else if (contract == "erc20Handler") {
                const bridgeAddress = config.bridge;
                if (bridgeAddress != "") {
                    const instant = await deployContract(
                        "ERC20Handler",
                        network.name,
                        ethers.getContractFactory,
                        deployer,
                        [bridgeAddress]
                    ) as ERC20Handler;
                    config.erc20Handler = instant.address;
                }
            } else if (contract == "erc721Handler") {
                const bridgeAddress = config.bridge;
                if (bridgeAddress != "") {
                    const instant = await deployContract(
                        "ERC721Handler",
                        network.name,
                        ethers.getContractFactory,
                        deployer,
                        [bridgeAddress]
                    ) as ERC721Handler;
                    config.erc721Handler = instant.address;
                }
            } else if (contract == "erc1155Handler") {
                const bridgeAddress = config.bridge;
                if (bridgeAddress != "") {
                    const instant = await deployContract(
                        "ERC1155Handler",
                        network.name,
                        ethers.getContractFactory,
                        deployer,
                        [bridgeAddress]
                    ) as ERC1155Handler;
                    config.erc1155Handler = instant.address;
                }
            } else if (contract == "genericHandler") {
                const bridgeAddress = config.bridge;
                if (bridgeAddress != "") {
                    const instant = await deployContract(
                        "GenericHandler",
                        network.name,
                        ethers.getContractFactory,
                        deployer,
                        [bridgeAddress]
                    ) as GenericHandler;
                    config.genericHandler = instant.address;
                }
            }
            saveConfig(network.name, config);
        }
    );