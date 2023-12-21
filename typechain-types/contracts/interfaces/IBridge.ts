/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../common";

export declare namespace IBridge {
  export type ProposalStruct = {
    _status: BigNumberish;
    _yesVotes: BigNumberish;
    _yesVotesTotal: BigNumberish;
    _proposedBlock: BigNumberish;
  };

  export type ProposalStructOutput = [number, BigNumber, number, number] & {
    _status: number;
    _yesVotes: BigNumber;
    _yesVotesTotal: number;
    _proposedBlock: number;
  };
}

export interface IBridgeInterface extends utils.Interface {
  functions: {
    "_domainID()": FunctionFragment;
    "_relayerThreshold()": FunctionFragment;
    "_resourceIDToHandlerAddress(bytes32)": FunctionFragment;
    "checkSignature(uint8,uint64,bytes32,bytes,bytes)": FunctionFragment;
    "deposit(uint8,bytes32,bytes,bytes)": FunctionFragment;
    "getProposal(uint8,uint64,bytes32,bytes)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "_domainID"
      | "_relayerThreshold"
      | "_resourceIDToHandlerAddress"
      | "checkSignature"
      | "deposit"
      | "getProposal"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "_domainID", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "_relayerThreshold",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_resourceIDToHandlerAddress",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "checkSignature",
    values: [BigNumberish, BigNumberish, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getProposal",
    values: [BigNumberish, BigNumberish, BytesLike, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: "_domainID", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_relayerThreshold",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_resourceIDToHandlerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkSignature",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getProposal",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IBridge extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IBridgeInterface;

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
    _domainID(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    _relayerThreshold(overrides?: CallOverrides): Promise<[number]>;

    _resourceIDToHandlerAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    checkSignature(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    deposit(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<ContractTransaction>;

    getProposal(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<[IBridge.ProposalStructOutput]>;
  };

  _domainID(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  _relayerThreshold(overrides?: CallOverrides): Promise<number>;

  _resourceIDToHandlerAddress(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  checkSignature(
    domainID: BigNumberish,
    depositNonce: BigNumberish,
    resourceID: BytesLike,
    data: BytesLike,
    signature: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  deposit(
    destinationDomainID: BigNumberish,
    resourceID: BytesLike,
    depositData: BytesLike,
    feeData: BytesLike,
    overrides?: PayableOverrides & { from?: string }
  ): Promise<ContractTransaction>;

  getProposal(
    originDomainID: BigNumberish,
    depositNonce: BigNumberish,
    resourceID: BytesLike,
    data: BytesLike,
    overrides?: CallOverrides
  ): Promise<IBridge.ProposalStructOutput>;

  callStatic: {
    _domainID(overrides?: CallOverrides): Promise<number>;

    _relayerThreshold(overrides?: CallOverrides): Promise<number>;

    _resourceIDToHandlerAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    checkSignature(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    deposit(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    getProposal(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<IBridge.ProposalStructOutput>;
  };

  filters: {};

  estimateGas: {
    _domainID(overrides?: Overrides & { from?: string }): Promise<BigNumber>;

    _relayerThreshold(overrides?: CallOverrides): Promise<BigNumber>;

    _resourceIDToHandlerAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkSignature(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposit(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<BigNumber>;

    getProposal(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _domainID(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    _relayerThreshold(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _resourceIDToHandlerAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    checkSignature(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposit(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    getProposal(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
