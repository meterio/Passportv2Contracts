import { task } from "hardhat/config";
import { utils } from "ethers";
import { Signatures } from "../typechain";

task("proposals", "get proposals from signature")
    .addParam("address", "signature contract address")
    .addParam("origin", "origin chain DomainID")
    .addParam("dest", "destination chaib DomainID")
    .addParam("nonce", "deposit Nonce")
    .addParam("resid", "resourceID")
    .addParam("data", "deposit data")
    .setAction(
        async ({ address, origin, dest, nonce, resid, data }, { ethers, run, network }) => {
            const [signer] = await ethers.getSigners();
            const contract = await ethers.getContractAt("Signatures", address, signer) as Signatures;
            const dataHash = utils.keccak256(data)
            const depositHash = utils.solidityKeccak256(
                ['uint256', 'uint256', 'uint256', 'bytes32', 'bytes32'],
                [origin, dest, nonce, resid, dataHash]
            );
            console.log("depositHash:", depositHash)
            console.log(await contract.proposals(depositHash));
        }
    );