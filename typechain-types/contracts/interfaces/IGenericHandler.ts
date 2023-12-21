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

export interface IGenericHandlerInterface extends utils.Interface {
  functions: {
    "removeResource(bytes32,address)": FunctionFragment;
    "setResource(bytes32,address,bytes4,uint256,bytes4)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "removeResource" | "setResource"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "removeResource",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setResource",
    values: [BytesLike, string, BytesLike, BigNumberish, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "removeResource",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setResource",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IGenericHandler extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IGenericHandlerInterface;

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
    removeResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      depositFunctionSig: BytesLike,
      depositFunctionDepositorOffset: BigNumberish,
      executeFunctionSig: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  removeResource(
    resourceID: BytesLike,
    contractAddress: string,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  setResource(
    resourceID: BytesLike,
    contractAddress: string,
    depositFunctionSig: BytesLike,
    depositFunctionDepositorOffset: BigNumberish,
    executeFunctionSig: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    removeResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      depositFunctionSig: BytesLike,
      depositFunctionDepositorOffset: BigNumberish,
      executeFunctionSig: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    removeResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      depositFunctionSig: BytesLike,
      depositFunctionDepositorOffset: BigNumberish,
      executeFunctionSig: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    removeResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      depositFunctionSig: BytesLike,
      depositFunctionDepositorOffset: BigNumberish,
      executeFunctionSig: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
