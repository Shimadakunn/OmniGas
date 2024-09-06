import { EstimateUserOperationGasReturnType } from "@/lib/smart-wallet/service/actions";
import {
  ERC4337RpcSchema,
  UserOperationAsHex,
} from "@/lib/smart-wallet/service/userOps";
import {
  Account,
  Chain,
  Client,
  Hash,
  PublicClient,
  PublicClientConfig,
  Transport,
  createPublicClient,
  http,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import { transport } from "../config";
import { SmartWalletActions, smartWalletActions } from "./decorators";
import { chains, ChainType } from "@/constants";

export type SmartWalletClient<
  chain extends Chain | undefined = Chain | undefined
> = Client<
  Transport,
  chain,
  Account | undefined,
  ERC4337RpcSchema,
  SmartWalletActions
> &
  PublicClient;

export const createSmartWalletClient = (
  parameters: PublicClientConfig
): SmartWalletClient => {
  const { key = "public", name = "Smart Wallet Client" } = parameters;
  const client = createPublicClient({
    ...parameters,
    key,
    name,
  });
  return client.extend(smartWalletActions);
};

class SmartWallet {
  private _client: SmartWalletClient;
  private _isInitiated: boolean = true;
  public feeToken: string = "full";

  constructor() {
    this._client = createSmartWalletClient({
      chain: arbitrumSepolia,
      transport: http(
        `https://public.api.stackup.sh/v1/node/${process.env.NEXT_PUBLIC_STACKUP_BUNDLER_API_KEY}`
      ),
    });
  }

  public setFeeToken(token: string) {
    localStorage.setItem("passkeys4337.feeToken", token);
    this.feeToken = token;
  }

  public init(chain: ChainType) {
    console.log("init smart wallet", chain);
    this._isInitiated = true;
    console.log("bundler rpc", chain.bundlerRpc);
    this._client = createSmartWalletClient({
      chain: chain.viem,
      transport: http(chain.bundlerRpc),
    });
  }

  public get client() {
    console.warn(
      "smartWallet: isInit() is not called. Only use this getter if you want to access wagmi publicClient method."
    );
    return this._client;
  }

  public async sendUserOperation(args: {
    userOp: UserOperationAsHex;
  }): Promise<`0x${string}`> {
    this._isInit();
    console.log("sending userOp", args);
    return await this._client.sendUserOperation({
      ...args,
    });
  }

  public async estimateUserOperationGas(args: {
    userOp: UserOperationAsHex;
  }): Promise<EstimateUserOperationGasReturnType> {
    console.log("estimating gas");
    this._isInit();
    return await this._client.estimateUserOperationGas({
      ...args,
    });
  }

  public async getUserOperationReceipt(args: {
    hash: Hash;
  }): Promise<`0x${string}`> {
    this._isInit();
    return await this._client.getUserOperationReceipt({
      ...args,
    });
  }

  public async getIsValidSignature(args: any): Promise<boolean> {
    this._isInit();
    return await this._client.getIsValidSignature({
      ...args,
    });
  }

  public async waitForUserOperationReceipt(args: any): Promise<any> {
    this._isInit();
    return await this._client.waitForUserOperationReceipt({
      ...args,
    });
  }

  private _isInit() {
    if (this._isInitiated) {
      return true;
    } else {
      throw new Error("SmartWallet is not initialized");
    }
  }
}

export const smartWallet = new SmartWallet();
