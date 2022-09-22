import { ContractFactory, Signer } from "ethers";
import { Provider } from "ethers/providers";
import { UnsignedTransaction } from "ethers/utils/transaction";
import { BigNumberish } from "ethers/utils";
import { TransactionOverrides } from ".";
import { Bridge } from "./Bridge";
export declare class BridgeFactory extends ContractFactory {
    constructor(signer?: Signer);
    deploy(domainID: BigNumberish, initialRelayers: string[], initialRelayerThreshold: BigNumberish, expiry: BigNumberish, overrides?: TransactionOverrides): Promise<Bridge>;
    getDeployTransaction(domainID: BigNumberish, initialRelayers: string[], initialRelayerThreshold: BigNumberish, expiry: BigNumberish, overrides?: TransactionOverrides): UnsignedTransaction;
    attach(address: string): Bridge;
    connect(signer: Signer): BridgeFactory;
    static connect(address: string, signerOrProvider: Signer | Provider): Bridge;
}
