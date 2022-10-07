import { task } from "hardhat/config";
import { expandDecimals } from "../script/deployTool";
import { utils } from "ethers";

task("datahash", "get datahash")
    .addParam("handler", "handler address")
    .addParam("amount", "deposit amount")
    .addParam("recipient", "recipient address")
    .setAction(
        async ({ handler, amount, recipient }, { ethers, run, network }) => {
            const data = '0x' +
                ethers.utils.hexZeroPad(ethers.BigNumber.from(expandDecimals(amount)).toHexString(), 32).substr(2) +  // Deposit Amount        (32 bytes)
                ethers.utils.hexZeroPad(ethers.utils.hexlify((recipient.length - 2) / 2), 32).substr(2) +    // len(recipientAddress) (32 bytes)
                recipient.substr(2);                    // recipientAddress      (?? bytes)
            console.log(utils.solidityKeccak256(['address', 'bytes32'], [handler, data]));
        }
    );