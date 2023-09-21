import { task } from "hardhat/config";
import { BridgeUpgradeable__factory } from "../typechain";
import { Result } from "ethers/lib/utils";

// npx hardhat decode-deposit-event --hash 0xfa0f8f162bab80cb0c68fa9119a6a1a7971dc01adf08ce169a73e13c28c55717 --network mainnet
task("decode-deposit-event", "decode deposit event")
  .addParam("hash", "event tx hash", "")
  .setAction(async ({ hash }, { ethers, run, network }) => {
    const signers = await ethers.getSigners();
    const deployer = signers[0];

    const tx = await ethers.provider.getTransactionReceipt(hash);
    let bridge_interface = new BridgeUpgradeable__factory().interface;
    let topic = bridge_interface.getEventTopic("Deposit");
    let decode: Result = [];

    for (let i = 0; i < tx.logs.length; i++) {
      if (tx.logs[i].topics[0] == topic) {
        decode = bridge_interface.decodeEventLog("Deposit", tx.logs[i].data);
      }
    }
    console.log(decode);
  });
