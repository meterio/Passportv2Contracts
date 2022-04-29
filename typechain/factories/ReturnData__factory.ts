/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { ReturnData } from "../ReturnData";

export class ReturnData__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<ReturnData> {
    return super.deploy(overrides || {}) as Promise<ReturnData>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ReturnData {
    return super.attach(address) as ReturnData;
  }
  connect(signer: Signer): ReturnData__factory {
    return super.connect(signer) as ReturnData__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ReturnData {
    return new Contract(address, _abi, signerOrProvider) as ReturnData;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "argument",
        type: "string",
      },
    ],
    name: "returnData",
    outputs: [
      {
        internalType: "bytes32",
        name: "response",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610154806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063e5f92e8614610030575b600080fd5b61004561003e36600461006d565b6020015190565b60405190815260200160405180910390f35b634e487b7160e01b600052604160045260246000fd5b60006020828403121561007f57600080fd5b813567ffffffffffffffff8082111561009757600080fd5b818401915084601f8301126100ab57600080fd5b8135818111156100bd576100bd610057565b604051601f8201601f19908116603f011681019083821181831017156100e5576100e5610057565b816040528281528760208487010111156100fe57600080fd5b82602086016020830137600092810160200192909252509594505050505056fea2646970667358221220e50c6e70983a5ec371d7b1bc62e2e7e1cefbac68af49b06cb65e4aa1ab770c6864736f6c634300080b0033";
