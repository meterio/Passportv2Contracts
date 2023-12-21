/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  TwoArguments,
  TwoArgumentsInterface,
} from "../../../contracts/TestContracts.sol/TwoArguments";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address[]",
        name: "argumentOne",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "bytes4",
        name: "argumentTwo",
        type: "bytes4",
      },
    ],
    name: "TwoArgumentsCalled",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "argumentOne",
        type: "address[]",
      },
      {
        internalType: "bytes4",
        name: "argumentTwo",
        type: "bytes4",
      },
    ],
    name: "twoArguments",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506101b4806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c806372e0745c14610030575b600080fd5b61004361003e366004610085565b610045565b005b7fc983106aca50fad459fb18ede1630e8ff8147ff28ad451a856427931fd7f15e383838360405161007893929190610118565b60405180910390a1505050565b60008060006040848603121561009a57600080fd5b833567ffffffffffffffff808211156100b257600080fd5b818601915086601f8301126100c657600080fd5b8135818111156100d557600080fd5b8760208260051b85010111156100ea57600080fd5b602092830195509350508401356001600160e01b03198116811461010d57600080fd5b809150509250925092565b604080825281018390526000846060830182805b878110156101605783356001600160a01b03811680821461014b578384fd5b8452506020938401939092019160010161012c565b5050809250505063ffffffff60e01b8316602083015294935050505056fea26469706673582212205abfd11c1aade35f80268c9580c3a12750816f5983edad927392eecc40ebd59164736f6c634300080b0033";

type TwoArgumentsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TwoArgumentsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TwoArguments__factory extends ContractFactory {
  constructor(...args: TwoArgumentsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<TwoArguments> {
    return super.deploy(overrides || {}) as Promise<TwoArguments>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): TwoArguments {
    return super.attach(address) as TwoArguments;
  }
  override connect(signer: Signer): TwoArguments__factory {
    return super.connect(signer) as TwoArguments__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TwoArgumentsInterface {
    return new utils.Interface(_abi) as TwoArgumentsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TwoArguments {
    return new Contract(address, _abi, signerOrProvider) as TwoArguments;
  }
}