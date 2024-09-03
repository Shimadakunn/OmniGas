import { Hex } from "viem";
import { arbitrumSepolia, Chain, optimismSepolia } from "viem/chains";

export type ChainType = {
  viem: Chain;
  bundlerRpc: any;
  eId: number;
  paymaster: Hex;
};

export const chains: {
  [key: string]: ChainType;
} = {
  arbitrumSepolia: {
    viem: arbitrumSepolia,
    bundlerRpc: `https://api.stackup.sh/v1/node/${process.env.NEXT_PUBLIC_STACKUP_BUNDLER_ARBITRUM_SEPOLIA_API_KEY}`,
    eId: 40231,
    paymaster: "0xe2A1e611c180fd59d930808Bbb1B76BBc9fC0583",
  },
  optimismSepolia: {
    viem: optimismSepolia,
    bundlerRpc: `https://api.stackup.sh/v1/node/${process.env.NEXT_PUBLIC_STACKUP_BUNDLER_OPTIMISM_SEPOLIA_API_KEY}`,
    eId: 40232,
    paymaster: "0x79ef52595911F4914135ea8e76977446653d7bED",
  },
};

export const CHAINS = {
  ...arbitrumSepolia,
  ...optimismSepolia,
};
