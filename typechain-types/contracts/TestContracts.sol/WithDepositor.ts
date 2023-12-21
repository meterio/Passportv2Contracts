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

export interface WithDepositorInterface extends utils.Interface {
  functions: {
    "withDepositor(address,uint256)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "withDepositor"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "withDepositor",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "withDepositor",
    data: BytesLike
  ): Result;

  events: {
    "WithDepositorCalled(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "WithDepositorCalled"): EventFragment;
}

export interface WithDepositorCalledEventObject {
  argumentOne: string;
  argumentTwo: BigNumber;
}
export type WithDepositorCalledEvent = TypedEvent<
  [string, BigNumber],
  WithDepositorCalledEventObject
>;

export type WithDepositorCalledEventFilter =
  TypedEventFilter<WithDepositorCalledEvent>;

export interface WithDepositor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: WithDepositorInterface;

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
    withDepositor(
      argumentOne: string,
      argumentTwo: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  withDepositor(
    argumentOne: string,
    argumentTwo: BigNumberish,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    withDepositor(
      argumentOne: string,
      argumentTwo: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "WithDepositorCalled(address,uint256)"(
      argumentOne?: null,
      argumentTwo?: null
    ): WithDepositorCalledEventFilter;
    WithDepositorCalled(
      argumentOne?: null,
      argumentTwo?: null
    ): WithDepositorCalledEventFilter;
  };

  estimateGas: {
    withDepositor(
      argumentOne: string,
      argumentTwo: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    withDepositor(
      argumentOne: string,
      argumentTwo: BigNumberish,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
