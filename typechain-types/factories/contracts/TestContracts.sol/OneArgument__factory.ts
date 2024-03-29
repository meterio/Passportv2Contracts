/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  OneArgument,
  OneArgumentInterface,
} from "../../../contracts/TestContracts.sol/OneArgument";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "argumentOne",
        type: "uint256",
      },
    ],
    name: "OneArgumentCalled",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "argumentOne",
        type: "uint256",
      },
    ],
    name: "oneArgument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5060ba8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063c95cf0d814602d575b600080fd5b603c6038366004606c565b603e565b005b60405181907f29ab08c845830c69b55a1fba5c95718f65dc24361a471e3da14cd5ff2b37315990600090a250565b600060208284031215607d57600080fd5b503591905056fea264697066735822122000afc635f4b817963a6505b2a47be44ff9b39a3f99936d09fd5581672c1c68b464736f6c634300080b0033";

type OneArgumentConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: OneArgumentConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class OneArgument__factory extends ContractFactory {
  constructor(...args: OneArgumentConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<OneArgument> {
    return super.deploy(overrides || {}) as Promise<OneArgument>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): OneArgument {
    return super.attach(address) as OneArgument;
  }
  override connect(signer: Signer): OneArgument__factory {
    return super.connect(signer) as OneArgument__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): OneArgumentInterface {
    return new utils.Interface(_abi) as OneArgumentInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OneArgument {
    return new Contract(address, _abi, signerOrProvider) as OneArgument;
  }
}
