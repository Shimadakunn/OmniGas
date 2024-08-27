import { sepolia, arbitrumSepolia, Chain, optimismSepolia } from "viem/chains";
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
