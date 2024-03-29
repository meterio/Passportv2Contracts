/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IDepositExecute,
  IDepositExecuteInterface,
} from "../../../contracts/interfaces/IDepositExecute";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "resourceID",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "depositor",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "deposit",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "resourceID",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "executeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IDepositExecute__factory {
  static readonly abi = _abi;
  static createInterface(): IDepositExecuteInterface {
    return new utils.Interface(_abi) as IDepositExecuteInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDepositExecute {
    return new Contract(address, _abi, signerOrProvider) as IDepositExecute;
  }
}
