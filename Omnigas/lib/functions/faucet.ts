import {
  EstimateFeesPerGasReturnType,
  Hex,
  encodeFunctionData,
  Address,
} from "viem";
import { smartWallet } from "@/lib/smart-wallet";
import { UserOpBuilder, emptyHex } from "@/lib/smart-wallet/service/userOps";

import { chains, TokenType, FAUCET_ADDRESS, FAUCET_ABI } from "@/constants";
import { createPublicClient, http } from "viem";
import { sepolia, mainnet, arbitrumSepolia } from "viem/chains";

const builder = new UserOpBuilder();

type Me = { account: Address; keyId: Hex; pubKey: { x: Hex; y: Hex } };

export async function InteractWithFaucet(
  token: TokenType,
  me: Me,
  setIsLoading: (loading: boolean) => void,
  refreshBalance: Function,
  setError: (error: any) => void
) {
  setIsLoading(true);
  try {
    smartWallet.init(chains[token.network]);
    builder.init(chains[token.network]);

    const { maxFeePerGas, maxPriorityFeePerGas }: EstimateFeesPerGasReturnType =
      await smartWallet.client.estimateFeesPerGas();

    const calls = [
      {
        dest: FAUCET_ADDRESS as Hex,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: FAUCET_ABI,
          functionName: "claim",
        }),
      },
    ];
    const userOp = await builder.buildUserOp({
      calls,
      maxFeePerGas: maxFeePerGas as bigint,
      maxPriorityFeePerGas: maxPriorityFeePerGas as bigint,
      keyId: me?.keyId as Hex,
    });
    console.log("userOp", userOp);
    const hash = await smartWallet.sendUserOperation({ userOp });
    console.log("useop sent");
    const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
    console.log("receipt", receipt);
    refreshBalance();
    setIsLoading(false);
    return receipt;
  } catch (e: any) {
    console.error(e);
    setError(e);
    setIsLoading(false);
    return e;
  }
}
