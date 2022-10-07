import { task } from "hardhat/config";
import { createResourceID } from "../script/deployTool";

task("resid", "get resource ID")
    .addParam("token", "Token address")
    .addParam("domain", "domain id")
    .setAction(
        async ({ token, domain }, { ethers, run, network }) => {
            console.log(createResourceID(token, domain))
        }
    );
