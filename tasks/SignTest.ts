import { task } from "hardhat/config";
import { utils } from "ethers";

task("sign-test", "get sign")
    .setAction(
        async ({ }, { ethers, run, network }) => {
            const [signer] = await ethers.getSigners();

            const name = "PermitBridge";
            const version = "1.0";

            const chainId = 3;
            const verifyingContract = "0x4eBc9d4Dd56278a4a8480a21f27CBA345668bdc4";

            const domainID = 5;
            const depositNonce = 22;
            const resourceID = "0x00000000000000000000008a419ef4941355476cf04933e90bf3bbf2f7381400";
            const data = "0x00000000000000000000000000000000000000000000000000194cb424068e000000000000000000000000000000000000000000000000000000000000000014551b6e92f7443e63ec2d0c43471de9574e834169";

            const domain = { name, version, chainId, verifyingContract };
            const types = {
                PermitBridge: [
                    { name: "domainID", type: "uint8" },
                    { name: "depositNonce", type: "uint64" },
                    { name: "resourceID", type: "bytes32" },
                    { name: "data", type: "bytes" }
                ],
            };
            const values = {
                domainID: domainID,
                depositNonce: depositNonce,
                resourceID: resourceID,
                data: data
            }
            const signature = await signer._signTypedData(domain, types, values);

            console.log("signature:", signature);

            const verify = utils.verifyTypedData(domain, types, values, signature);
            console.log("verify", verify);
        }
    );