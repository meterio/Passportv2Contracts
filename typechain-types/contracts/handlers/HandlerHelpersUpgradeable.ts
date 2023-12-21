/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../common";

export interface HandlerHelpersUpgradeableInterface extends utils.Interface {
  functions: {
    "_bridgeAddress()": FunctionFragment;
    "_burnList(address)": FunctionFragment;
    "_contractWhitelist(address)": FunctionFragment;
    "_resourceIDToTokenContractAddress(bytes32)": FunctionFragment;
    "_tokenContractAddressToResourceID(address)": FunctionFragment;
    "isNative(address)": FunctionFragment;
    "removeResource(bytes32,address)": FunctionFragment;
    "setBurnable(address)": FunctionFragment;
    "setNative(address,bool)": FunctionFragment;
    "setResource(bytes32,address)": FunctionFragment;
    "withdraw(bytes)": FunctionFragment;
    "withdrawETH(bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_bridgeAddress"
      | "_burnList"
      | "_contractWhitelist"
      | "_resourceIDToTokenContractAddress"
      | "_tokenContractAddressToResourceID"
      | "isNative"
      | "removeResource"
      | "setBurnable"
      | "setNative"
      | "setResource"
      | "withdraw"
      | "withdrawETH"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_bridgeAddress",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "_burnList", values: [string]): string;
  encodeFunctionData(
    functionFragment: "_contractWhitelist",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "_resourceIDToTokenContractAddress",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "_tokenContractAddressToResourceID",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "isNative", values: [string]): string;
  encodeFunctionData(
    functionFragment: "removeResource",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(functionFragment: "setBurnable", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setNative",
    values: [string, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setResource",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(functionFragment: "withdraw", values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: "withdrawETH",
    values: [BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "_bridgeAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "_burnList", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_contractWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_resourceIDToTokenContractAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_tokenContractAddressToResourceID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "isNative", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "removeResource",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBurnable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setNative", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setResource",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawETH",
    data: BytesLike
  ): Result;

  events: {
    "Initialized(uint8)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface HandlerHelpersUpgradeable extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: HandlerHelpersUpgradeableInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    _bridgeAddress(overrides?: CallOverrides): Promise<[string]>;

    _burnList(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;

    _contractWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    _resourceIDToTokenContractAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    _tokenContractAddressToResourceID(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    isNative(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;

    removeResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setBurnable(
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setNative(
      nativeAddress: string,
      _isNative: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    withdraw(
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    withdrawETH(
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  _bridgeAddress(overrides?: CallOverrides): Promise<string>;

  _burnList(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  _contractWhitelist(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  _resourceIDToTokenContractAddress(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  _tokenContractAddressToResourceID(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<string>;

  isNative(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  removeResource(
    resourceID: BytesLike,
    contractAddress: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setBurnable(
    contractAddress: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setNative(
    nativeAddress: string,
    _isNative: boolean,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setResource(
    resourceID: BytesLike,
    contractAddress: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  withdraw(
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  withdrawETH(
    data: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    _bridgeAddress(overrides?: CallOverrides): Promise<string>;

    _burnList(arg0: string, overrides?: CallOverrides): Promise<boolean>;

    _contractWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    _resourceIDToTokenContractAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    _tokenContractAddressToResourceID(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<string>;

    isNative(arg0: string, overrides?: CallOverrides): Promise<boolean>;

    removeResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setBurnable(
      contractAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setNative(
      nativeAddress: string,
      _isNative: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    withdraw(data: BytesLike, overrides?: CallOverrides): Promise<void>;

    withdrawETH(data: BytesLike, overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;
  };

  estimateGas: {
    _bridgeAddress(overrides?: CallOverrides): Promise<BigNumber>;

    _burnList(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    _contractWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _resourceIDToTokenContractAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _tokenContractAddressToResourceID(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isNative(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    removeResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setBurnable(
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setNative(
      nativeAddress: string,
      _isNative: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    withdraw(
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    withdrawETH(
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _bridgeAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _burnList(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _contractWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _resourceIDToTokenContractAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _tokenContractAddressToResourceID(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isNative(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    removeResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setBurnable(
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setNative(
      nativeAddress: string,
      _isNative: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    withdraw(
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    withdrawETH(
      data: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
