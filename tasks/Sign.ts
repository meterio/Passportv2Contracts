import { task } from "hardhat/config";
import { getSign } from "../script/permitSign";
import { Signer } from "ethers";

task("sign", "get sign")
    .addParam("bridge", "bridge address")
    .addParam("domain", "domain id")
    .addParam("nonce", "depositNonce")
    .addParam("resid", "resourceID")
    .addParam("data", "deposit data")
    .addParam("chainid", "chainId")
    .addParam("relayer", "relayer")
    .setAction(
        async ({ bridge, domain, nonce, resid, data, chainid, relayer }, { ethers, run, network }) => {
            const signer = await ethers.getSigners();

            let signature = await getSign(
                signer[relayer] as Signer,
                bridge,
                domain,
                nonce,
                resid,
                data,
                chainid
            );
            console.log(signature)
        }
    );
