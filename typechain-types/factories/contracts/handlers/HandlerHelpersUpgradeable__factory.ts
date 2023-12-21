/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  HandlerHelpersUpgradeable,
  HandlerHelpersUpgradeableInterface,
} from "../../../contracts/handlers/HandlerHelpersUpgradeable";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    inputs: [],
    name: "_bridgeAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "_burnList",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "_contractWhitelist",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_resourceIDToTokenContractAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "_tokenContractAddressToResourceID",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isNative",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
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
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "removeResource",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "setBurnable",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "nativeAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_isNative",
        type: "bool",
      },
    ],
    name: "setNative",
    outputs: [],
    stateMutability: "nonpayable",
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
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
    ],
    name: "setResource",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506105c4806100206000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c80637f79bea8116100715780637f79bea814610184578063a9815751146101a7578063ab5c7bf1146100ce578063b2b8b5dd146101ba578063b8fa3736146101dd578063c8ba6c87146101f057600080fd5b806307b7ed99146100b95780630968f264146100ce5780630a6d55d8146100df578063318c136e146101255780636a70d0811461013e578063789d771114610171575b600080fd5b6100cc6100c7366004610424565b61021e565b005b6100cc6100dc36600461045c565b50565b6101086100ed36600461050d565b6001602052600090815260409020546001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b600054610108906201000090046001600160a01b031681565b61016161014c366004610424565b60046020526000908152604090205460ff1681565b604051901515815260200161011c565b6100cc61017f366004610526565b61022f565b610161610192366004610424565b60036020526000908152604090205460ff1681565b6100cc6101b5366004610562565b610262565b6101616101c8366004610424565b60056020526000908152604090205460ff1681565b6100cc6101eb366004610562565b6102b1565b6102106101fe366004610424565b60026020526000908152604090205481565b60405190815260200161011c565b610226610309565b6100dc81610370565b610237610309565b6001600160a01b03919091166000908152600560205260409020805460ff1916911515919091179055565b61026a610309565b600091825260016020908152604080842080546001600160a01b03191690556001600160a01b0392909216835260028152818320839055600390529020805460ff19169055565b6102b9610309565b600082815260016020818152604080842080546001600160a01b0319166001600160a01b0387169081179091558452600282528084208690556003909152909120805460ff191690911790555050565b6000546201000090046001600160a01b0316331461036e5760405162461bcd60e51b815260206004820152601e60248201527f73656e646572206d7573742062652062726964676520636f6e7472616374000060448201526064015b60405180910390fd5b565b6001600160a01b03811660009081526003602052604090205460ff166103e45760405162461bcd60e51b8152602060048201526024808201527f70726f766964656420636f6e7472616374206973206e6f742077686974656c696044820152631cdd195960e21b6064820152608401610365565b6001600160a01b03166000908152600460205260409020805460ff19166001179055565b80356001600160a01b038116811461041f57600080fd5b919050565b60006020828403121561043657600080fd5b61043f82610408565b9392505050565b634e487b7160e01b600052604160045260246000fd5b60006020828403121561046e57600080fd5b813567ffffffffffffffff8082111561048657600080fd5b818401915084601f83011261049a57600080fd5b8135818111156104ac576104ac610446565b604051601f8201601f19908116603f011681019083821181831017156104d4576104d4610446565b816040528281528760208487010111156104ed57600080fd5b826020860160208301376000928101602001929092525095945050505050565b60006020828403121561051f57600080fd5b5035919050565b6000806040838503121561053957600080fd5b61054283610408565b91506020830135801515811461055757600080fd5b809150509250929050565b6000806040838503121561057557600080fd5b8235915061058560208401610408565b9050925092905056fea264697066735822122099422acb34cd77dbf41776709cdc3a0d0e5f4e3b38d97f424835fd78d2ab78a264736f6c634300080b0033";

type HandlerHelpersUpgradeableConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: HandlerHelpersUpgradeableConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class HandlerHelpersUpgradeable__factory extends ContractFactory {
  constructor(...args: HandlerHelpersUpgradeableConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<HandlerHelpersUpgradeable> {
    return super.deploy(overrides || {}) as Promise<HandlerHelpersUpgradeable>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): HandlerHelpersUpgradeable {
    return super.attach(address) as HandlerHelpersUpgradeable;
  }
  override connect(signer: Signer): HandlerHelpersUpgradeable__factory {
    return super.connect(signer) as HandlerHelpersUpgradeable__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): HandlerHelpersUpgradeableInterface {
    return new utils.Interface(_abi) as HandlerHelpersUpgradeableInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): HandlerHelpersUpgradeable {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as HandlerHelpersUpgradeable;
  }
}