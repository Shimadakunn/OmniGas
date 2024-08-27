import {
  ChainType,
  ENTRYPOINT_ABI,
  ENTRYPOINT_ADDRESS,
  FACTORY_ABI,
} from "@/constants";
import { smartWallet } from "@/lib/smart-wallet";
import { DEFAULT_USER_OP } from "@/lib/smart-wallet/service/userOps/constants";
import {
  Call,
  UserOperation,
  UserOperationAsHex,
} from "@/lib/smart-wallet/service/userOps/types";
import { P256Credential, WebAuthn } from "@/lib/web-authn";
import {
  Address,
  Chain,
  GetContractReturnType,
  Hex,
  PublicClient,
  WalletClient,
  concat,
  createPublicClient,
  createWalletClient,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  getContract,
  http,
  keccak256,
  parseAbi,
  parseAbiParameters,
  parseUnits,
  toHex,
  zeroAddress,
} from "viem";
import { arbitrumSepolia } from "viem/chains";

export class UserOpBuilder {
  public relayer: Hex = "0x1f29312f134C79984bA4b21840f2C3DcF57b9c85";
  public entryPoint: Hex = ENTRYPOINT_ADDRESS;
  // public paymaster: Hex = process.env
  //   .NEXT_PUBLIC_PAYMASTER_CONTRACT_ADDRESS! as Hex;
  public paymaster: Hex = "0x20C95713389E68f7fB8Cb4eE82aF9Fe205B11850";
  public chain: Chain;
  public publicClient: PublicClient;
  public factoryContract: GetContractReturnType<
    typeof FACTORY_ABI,
    WalletClient,
    PublicClient
  >;

  constructor() {
    this.chain = arbitrumSepolia;
    this.publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(),
    });

    const walletClient = createWalletClient({
      account: this.relayer,
      chain: arbitrumSepolia,
      transport: http(),
    });

    this.factoryContract = getContract({
      address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex, // only on Sepolia
      abi: FACTORY_ABI,
      walletClient,
      publicClient: this.publicClient,
    });
  }

  async init(chain: ChainType) {
    console.log("chain", chain);
    this.publicClient = createPublicClient({
      chain: chain.viem,
      transport: http(),
    });
    const walletClient = createWalletClient({
      account: this.relayer,
      chain: chain.viem,
      transport: http(),
    });
    this.factoryContract = getContract({
      address: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS as Hex, // only on Sepolia
      abi: FACTORY_ABI,
      walletClient,
      publicClient: this.publicClient,
    });
  }

  // reference: https://ethereum.stackexchange.com/questions/150796/how-to-create-a-raw-erc-4337-useroperation-from-scratch-and-then-send-it-to-bund
  async buildUserOp({
    calls,
    maxFeePerGas,
    maxPriorityFeePerGas,
    keyId,
  }: {
    calls: Call[];
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    keyId: Hex;
  }): Promise<UserOperationAsHex> {
    // calculate smart wallet address via Factory contract to know the sender
    const { account, publicKey } = await this._calculateSmartWalletAddress(
      keyId
    ); // the keyId is the id tied to the user's public key

    // get bytecode
    const bytecode = await this.publicClient.getBytecode({
      address: account,
    });

    let initCode = toHex(new Uint8Array(0));
    let initCodeGas = BigInt(0);
    if (bytecode === undefined) {
      // smart wallet does NOT already exists
      // calculate initCode and initCodeGas
      ({ initCode, initCodeGas } = await this._createInitCode(publicKey));
    }

    // calculate nonce
    const nonce = await this._getNonce(account);

    // create callData
    const callData = this._addCallData(calls);

    // create user operation
    const userOp: UserOperation = {
      ...DEFAULT_USER_OP,
      sender: account,
      nonce,
      initCode,
      callData,
      maxFeePerGas,
      maxPriorityFeePerGas,
    };

    // estimate gas for this partial user operation
    // real good article about the subject can be found here:
    // https://www.alchemy.com/blog/erc-4337-gas-estimation
    const { callGasLimit, verificationGasLimit, preVerificationGas } =
      await smartWallet.estimateUserOperationGas({
        userOp: this.toParams(userOp),
      });

    // set gas limits with the estimated values + some extra gas for safety
    userOp.callGasLimit = BigInt(callGasLimit) + BigInt(400_000);
    userOp.preVerificationGas =
      BigInt(preVerificationGas) * BigInt(2) + BigInt(400_000);
    userOp.verificationGasLimit =
      BigInt(verificationGasLimit) +
      BigInt(400_000) +
      BigInt(initCodeGas) +
      BigInt(2_000_000);

    const exchangeRate = parseUnits("2680", 6);

    const encodedData = encodeAbiParameters(
      parseAbiParameters("address , uint256"),
      ["0x3870419Ba2BBf0127060bCB37f69A1b1C090992B", exchangeRate]
    );
    userOp.paymasterAndData = concat([this.paymaster, encodedData]);

    userOp.paymasterAndData = this.paymaster;
    console.log("PaymasterAndData", userOp.paymasterAndData);

    // get userOp hash (with signature == 0x) by calling the entry point contract
    const userOpHash = await this._getUserOpHash(userOp);

    // version = 1 and validUntil = 0 in msgToSign are hardcoded
    const msgToSign = encodePacked(
      ["uint8", "uint48", "bytes32"],
      [1, 0, userOpHash]
    );

    // get signature from webauthn
    const signature = await this.getSignature(msgToSign, keyId);

    return this.toParams({ ...userOp, signature });
  }

  public toParams(op: UserOperation): UserOperationAsHex {
    return {
      sender: op.sender,
      nonce: toHex(op.nonce),
      initCode: op.initCode,
      callData: op.callData,
      callGasLimit: toHex(op.callGasLimit),
      verificationGasLimit: toHex(op.verificationGasLimit),
      preVerificationGas: toHex(op.preVerificationGas),
      maxFeePerGas: toHex(op.maxFeePerGas),
      maxPriorityFeePerGas: toHex(op.maxPriorityFeePerGas),
      paymasterAndData:
        op.paymasterAndData === zeroAddress ? "0x" : op.paymasterAndData,
      signature: op.signature,
    };
  }

  public async getSignature(msgToSign: Hex, keyId: Hex): Promise<Hex> {
    const credentials: P256Credential = (await WebAuthn.get(
      msgToSign
    )) as P256Credential;

    if (credentials.rawId !== keyId) {
      throw new Error(
        "Incorrect passkeys used for tx signing. Please sign the transaction with the correct logged-in account"
      );
    }

    const signature = encodePacked(
      ["uint8", "uint48", "bytes"],
      [
        1,
        0,
        encodeAbiParameters(
          [
            {
              type: "tuple",
              name: "credentials",
              components: [
                {
                  name: "authenticatorData",
                  type: "bytes",
                },
                {
                  name: "clientDataJSON",
                  type: "string",
                },
                {
                  name: "challengeLocation",
                  type: "uint256",
                },
                {
                  name: "responseTypeLocation",
                  type: "uint256",
                },
                {
                  name: "r",
                  type: "bytes32",
                },
                {
                  name: "s",
                  type: "bytes32",
                },
              ],
            },
          ],
          [
            {
              authenticatorData: credentials.authenticatorData,
              clientDataJSON: JSON.stringify(credentials.clientData),
              challengeLocation: BigInt(23),
              responseTypeLocation: BigInt(1),
              r: credentials.signature.r,
              s: credentials.signature.s,
            },
          ]
        ),
      ]
    );

    return signature;
  }

  private async _createInitCode(
    pubKey: readonly [Hex, Hex]
  ): Promise<{ initCode: Hex; initCodeGas: bigint }> {
    let createAccountTx = encodeFunctionData({
      abi: FACTORY_ABI,
      functionName: "createAccount",
      args: [pubKey],
    });

    let initCode = encodePacked(
      ["address", "bytes"], // types
      [this.factoryContract.address, createAccountTx] // values
    );

    let initCodeGas = await this.publicClient.estimateGas({
      account: this.relayer,
      to: this.factoryContract.address,
      data: createAccountTx,
    });

    return {
      initCode,
      initCodeGas,
    };
  }

  private async _calculateSmartWalletAddress(
    id: Hex
  ): Promise<{ account: Address; publicKey: readonly [Hex, Hex] }> {
    const user = await this.factoryContract.read.getUser([BigInt(id)]);
    return { account: user.account, publicKey: user.publicKey };
  }

  private _addCallData(calls: Call[]): Hex {
    return encodeFunctionData({
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "dest",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "data",
                  type: "bytes",
                },
              ],
              internalType: "struct Call[]",
              name: "calls",
              type: "tuple[]",
            },
          ],
          name: "executeBatch",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "executeBatch",
      args: [calls],
    });
  }

  private async _getNonce(smartWalletAddress: Hex): Promise<bigint> {
    const nonce: bigint = await this.publicClient.readContract({
      address: this.entryPoint,
      abi: parseAbi([
        "function getNonce(address, uint192) view returns (uint256)",
      ]),
      functionName: "getNonce",
      args: [smartWalletAddress, BigInt(0)],
    });
    return nonce;
  }

  private async _getUserOpHash(userOp: UserOperation): Promise<Hex> {
    const entryPointContract = getContract({
      address: this.entryPoint,
      abi: ENTRYPOINT_ABI,
      publicClient: this.publicClient,
    });

    const userOpHash = entryPointContract.read.getUserOpHash([userOp]);
    return userOpHash;
  }

  private async _getPaymasterAndData(
    validUntil: number,
    validAfter: number,
    erc20Token: Hex,
    exchangeRate: bigint,
    keyId: Hex,
    pubKey: any
  ): Promise<Hex> {
    const encodedData = encodeAbiParameters(
      [
        { name: "validUntil", type: "uint48" },
        { name: "validAfter", type: "uint48" },
        { name: "erc20Token", type: "address" },
        { name: "exchangeRate", type: "uint256" },
        { name: "pubKeyX", type: "bytes32" },
        { name: "pubKeyY", type: "bytes32" },
      ],
      [validUntil, validAfter, erc20Token, exchangeRate, pubKey[0], pubKey[1]]
    );
    console.log("encodedData", encodedData);
    console.log("encodedData Length", encodedData.length);
    const dataHash = keccak256(encodedData);
    console.log("dataHash", dataHash);
    const msgToSign = encodePacked(
      ["uint8", "uint48", "bytes32"],
      [1, 0, dataHash]
    );
    console.log("msgToSign", msgToSign);

    const signature = await this.getSignature(msgToSign, keyId);
    console.log("signature", signature);

    return concat([this.paymaster, encodedData, signature]) as Hex;
  }
}
