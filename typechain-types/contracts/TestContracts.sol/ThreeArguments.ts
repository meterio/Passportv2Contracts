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

export interface ThreeArgumentsInterface extends utils.Interface {
  functions: {
    "threeArguments(string,int8,bool)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "threeArguments"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "threeArguments",
    values: [string, BigNumberish, boolean]
  ): string;

  decodeFunctionResult(
    functionFragment: "threeArguments",
    data: BytesLike
  ): Result;

  events: {
    "ThreeArgumentsCalled(string,int8,bool)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ThreeArgumentsCalled"): EventFragment;
}

export interface ThreeArgumentsCalledEventObject {
  argumentOne: string;
  argumentTwo: number;
  argumentThree: boolean;
}
export type ThreeArgumentsCalledEvent = TypedEvent<
  [string, number, boolean],
  ThreeArgumentsCalledEventObject
>;

export type ThreeArgumentsCalledEventFilter =
  TypedEventFilter<ThreeArgumentsCalledEvent>;

export interface ThreeArguments extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ThreeArgumentsInterface;

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
    threeArguments(
      argumentOne: string,
      argumentTwo: BigNumberish,
      argumentThree: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;
  };

  threeArguments(
    argumentOne: string,
    argumentTwo: BigNumberish,
    argumentThree: boolean,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  callStatic: {
    threeArguments(
      argumentOne: string,
      argumentTwo: BigNumberish,
      argumentThree: boolean,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "ThreeArgumentsCalled(string,int8,bool)"(
      argumentOne?: null,
      argumentTwo?: null,
      argumentThree?: null
    ): ThreeArgumentsCalledEventFilter;
    ThreeArgumentsCalled(
      argumentOne?: null,
      argumentTwo?: null,
      argumentThree?: null
    ): ThreeArgumentsCalledEventFilter;
  };

  estimateGas: {
    threeArguments(
      argumentOne: string,
      argumentTwo: BigNumberish,
      argumentThree: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    threeArguments(
      argumentOne: string,
      argumentTwo: BigNumberish,
      argumentThree: boolean,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;
  };
}
