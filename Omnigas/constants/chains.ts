import {
  sepolia,
  arbitrumSepolia,
  Chain,
  optimismSepolia,
  avalancheFuji,
} from "viem/chains";
import { http } from "viem";
import { defineChain } from "viem";

export type ChainType = {
  viem: Chain;
  bundlerRpc: any;
  transport?: any;
  fee?: string;
};

export const chains: {
  [key: string]: ChainType;
} = {
  arbitrumSepolia: {
    viem: arbitrumSepolia,
    bundlerRpc: `https://api.stackup.sh/v1/node/${process.env.NEXT_PUBLIC_STACKUP_BUNDLER_ARBITRUM_SEPOLIA_API_KEY}`,
  },
  optimismSepolia: {
    viem: optimismSepolia,
    bundlerRpc: `https://api.stackup.sh/v1/node/${process.env.NEXT_PUBLIC_STACKUP_BUNDLER_OPTIMISM_SEPOLIA_API_KEY}`,
  },
};

export const CHAINS = {
  ...arbitrumSepolia,
  ...optimismSepolia,
};

export const PAYMASTER_ABI = [
  {
    inputs: [
      {
        internalType: "contract IEntryPoint",
        name: "_entryPoint",
        type: "address",
      },
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "address", name: "_endpoint", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "InvalidDelegate", type: "error" },
  { inputs: [], name: "InvalidEndpointCall", type: "error" },
  {
    inputs: [{ internalType: "uint16", name: "optionType", type: "uint16" }],
    name: "InvalidOptionType",
    type: "error",
  },
  { inputs: [], name: "LzTokenUnavailable", type: "error" },
  {
    inputs: [{ internalType: "uint32", name: "eid", type: "uint32" }],
    name: "NoPeer",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "msgValue", type: "uint256" }],
    name: "NotEnoughNative",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "OnlyEndpoint",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint32", name: "eid", type: "uint32" },
      { internalType: "bytes32", name: "sender", type: "bytes32" },
    ],
    name: "OnlyPeer",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bytes", name: "context", type: "bytes" },
    ],
    name: "Context",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "contract IERC20",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "exchangeRate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "destEid",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxFeePerGas",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxPriorityFeePerGas",
        type: "uint256",
      },
    ],
    name: "ContextDecoded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "erc20Token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "exchangeRate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "destEid",
        type: "uint256",
      },
    ],
    name: "DecodeData",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "opGasPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "actualTokenCost",
        type: "uint256",
      },
    ],
    name: "GasCalculation",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "fee", type: "uint256" },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "LzSend",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "dstEid",
        type: "uint32",
      },
    ],
    name: "Message",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "actualTokenCost",
        type: "uint256",
      },
    ],
    name: "MessageReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "OpGasMethod",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "enum IPaymaster.PostOpMode",
        name: "mode",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum IPaymaster.PostOpMode",
        name: "mode2",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum IPaymaster.PostOpMode",
        name: "mode3",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum IPaymaster.PostOpMode",
        name: "mode4",
        type: "uint8",
      },
    ],
    name: "OpMode",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint32", name: "eid", type: "uint32" },
      {
        indexed: false,
        internalType: "bytes32",
        name: "peer",
        type: "bytes32",
      },
    ],
    name: "PeerSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "enum IPaymaster.PostOpMode",
        name: "mode",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "actualGasCost",
        type: "uint256",
      },
    ],
    name: "PostOp",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint32",
        name: "dstEid",
        type: "uint32",
      },
      {
        components: [
          { internalType: "uint256", name: "nativeFee", type: "uint256" },
          { internalType: "uint256", name: "lzTokenFee", type: "uint256" },
        ],
        indexed: false,
        internalType: "struct MessagingFee",
        name: "fee",
        type: "tuple",
      },
    ],
    name: "Quote",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint32", name: "unstakeDelaySec", type: "uint32" },
    ],
    name: "addStake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_addr", type: "address" }],
    name: "addressToBytes32",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "srcEid", type: "uint32" },
          { internalType: "bytes32", name: "sender", type: "bytes32" },
          { internalType: "uint64", name: "nonce", type: "uint64" },
        ],
        internalType: "struct Origin",
        name: "origin",
        type: "tuple",
      },
    ],
    name: "allowInitializePath",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_b", type: "bytes32" }],
    name: "bytes32ToAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "chainId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "data",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "endpoint",
    outputs: [
      {
        internalType: "contract ILayerZeroEndpointV2",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "entryPoint",
    outputs: [
      { internalType: "contract IEntryPoint", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getDeposit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "srcEid", type: "uint32" },
          { internalType: "bytes32", name: "sender", type: "bytes32" },
          { internalType: "uint64", name: "nonce", type: "uint64" },
        ],
        internalType: "struct Origin",
        name: "",
        type: "tuple",
      },
      { internalType: "bytes", name: "", type: "bytes" },
      { internalType: "address", name: "_sender", type: "address" },
    ],
    name: "isComposeMsgSender",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "srcEid", type: "uint32" },
          { internalType: "bytes32", name: "sender", type: "bytes32" },
          { internalType: "uint64", name: "nonce", type: "uint64" },
        ],
        internalType: "struct Origin",
        name: "_origin",
        type: "tuple",
      },
      { internalType: "bytes32", name: "_guid", type: "bytes32" },
      { internalType: "bytes", name: "_message", type: "bytes" },
      { internalType: "address", name: "_executor", type: "address" },
      { internalType: "bytes", name: "_extraData", type: "bytes" },
    ],
    name: "lzReceive",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint32", name: "", type: "uint32" },
      { internalType: "bytes32", name: "", type: "bytes32" },
    ],
    name: "nextNonce",
    outputs: [{ internalType: "uint64", name: "nonce", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oAppVersion",
    outputs: [
      { internalType: "uint64", name: "senderVersion", type: "uint64" },
      { internalType: "uint64", name: "receiverVersion", type: "uint64" },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint32", name: "eid", type: "uint32" }],
    name: "peers",
    outputs: [{ internalType: "bytes32", name: "peer", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum IPaymaster.PostOpMode",
        name: "mode",
        type: "uint8",
      },
      { internalType: "bytes", name: "context", type: "bytes" },
      { internalType: "uint256", name: "actualGasCost", type: "uint256" },
    ],
    name: "postOp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "postOpGas",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint32", name: "_dstEid", type: "uint32" },
      { internalType: "bytes", name: "message", type: "bytes" },
    ],
    name: "quote",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "nativeFee", type: "uint256" },
          { internalType: "uint256", name: "lzTokenFee", type: "uint256" },
        ],
        internalType: "struct MessagingFee",
        name: "fee",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_chainId", type: "uint256" }],
    name: "setChainId",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_delegate", type: "address" }],
    name: "setDelegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint32", name: "_eid", type: "uint32" },
      { internalType: "bytes32", name: "_peer", type: "bytes32" },
    ],
    name: "setPeer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_postOpGas", type: "uint256" }],
    name: "setPostOpGas",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_limit", type: "uint256" }],
    name: "setSponsoredGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_vault", type: "address" }],
    name: "setVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "sponsoredGasLimit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unlockStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "uint256", name: "nonce", type: "uint256" },
          { internalType: "bytes", name: "initCode", type: "bytes" },
          { internalType: "bytes", name: "callData", type: "bytes" },
          { internalType: "uint256", name: "callGasLimit", type: "uint256" },
          {
            internalType: "uint256",
            name: "verificationGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          { internalType: "uint256", name: "maxFeePerGas", type: "uint256" },
          {
            internalType: "uint256",
            name: "maxPriorityFeePerGas",
            type: "uint256",
          },
          { internalType: "bytes", name: "paymasterAndData", type: "bytes" },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct UserOperation",
        name: "userOp",
        type: "tuple",
      },
      { internalType: "bytes32", name: "userOpHash", type: "bytes32" },
      { internalType: "uint256", name: "maxCost", type: "uint256" },
    ],
    name: "validatePaymasterUserOp",
    outputs: [
      { internalType: "bytes", name: "context", type: "bytes" },
      { internalType: "uint256", name: "validationData", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "vault",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "withdrawAddress",
        type: "address",
      },
    ],
    name: "withdrawStake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "withdrawAddress",
        type: "address",
      },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];
