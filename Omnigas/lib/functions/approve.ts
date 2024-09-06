import {
  Chain,
  EstimateFeesPerGasReturnType,
  Hash,
  Hex,
  parseEther,
  parseUnits,
  encodeFunctionData,
  Address,
} from "viem";
import { smartWallet } from "@/lib/smart-wallet";
import { useEffect, useRef, useState } from "react";
import { UserOpBuilder, emptyHex } from "@/lib/smart-wallet/service/userOps";
import { useBalance } from "@/providers/BalanceProvider";
import { useMe } from "@/providers/MeProvider";

import {
  chains,
  contracts,
  tokens,
  ChainType,
  ContractType,
  TokenType,
  AAVE_ABI,
  ERC20_ABI,
  AAVE_IPOOL_ABI,
} from "@/constants";

const builder = new UserOpBuilder();

type Me = { account: Address; keyId: Hex; pubKey: { x: Hex; y: Hex } };

export async function ApproveErc20(
  token: TokenType,
  me: Me,
  amount: string,
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

    const approvedWithdrawAmount = parseUnits(
      amount,
      token.decimals!
    ).toString();

    console.log("approvedWithdrawAmount", approvedWithdrawAmount);
    console.log("paymaster", chains[token.network].paymaster);

    const calls = [
      {
        dest: token.address as Hex,
        value: parseUnits("0", 6),
        data: encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "approve",
          args: [
            chains[token.network].paymaster,
            BigInt(approvedWithdrawAmount),
          ],
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
