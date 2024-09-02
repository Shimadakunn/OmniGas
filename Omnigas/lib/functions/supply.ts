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

export async function Supply(
  contract: ContractType,
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

    let calls;
    if (token.address) {
      calls = SupplyErc20Aave(contract, token, me, amount);
    } else {
      calls = SupplyEthAave(contract, token, me, amount);
    }

    const userOp = await builder.buildUserOp({
      calls,
      maxFeePerGas: maxFeePerGas as bigint,
      maxPriorityFeePerGas: maxPriorityFeePerGas as bigint,
      keyId: me?.keyId as Hex,
    });
    console.log("userOp", userOp);
    const hash = await smartWallet.sendUserOperation({ userOp });
    console.log("user op sent", hash);
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

function SupplyEthAave(
  contract: ContractType,
  token: TokenType,
  me: Me,
  amount: string
) {
  // const paymasterContract = "0x20C95713389E68f7fB8Cb4eE82aF9Fe205B11850";
  // const approvedWithdrawAmount = 10000000000000000;
  // const approveErc20Fee = {
  //   dest: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7" as Hex,
  //   value: parseUnits("0", 6),
  //   data: encodeFunctionData({
  //     abi: ERC20_ABI,
  //     functionName: "approve",
  //     args: [paymasterContract, BigInt(approvedWithdrawAmount)],
  //   }),
  // };

  const calls = [
    // approveErc20Fee,
    {
      dest: contract.address as Hex,
      value: parseEther(amount),
      data: encodeFunctionData({
        abi: AAVE_ABI,
        functionName: "depositETH",
        args: [contract.ipoolAddress as Hex, me!.account, 0],
      }),
    },
  ];
  return calls;
}

function SupplyErc20Aave(
  contract: ContractType,
  token: TokenType,
  me: Me,
  amount: string
) {
  const approve = {
    dest: token.address as Hex,
    value: parseUnits("0", 6),
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [contract.ipoolAddress as Hex, parseUnits(amount, token.decimals!)],
    }),
  };
  const supply = {
    dest: contract.ipoolAddress as Hex,
    value: parseUnits("0", 6),
    data: encodeFunctionData({
      abi: AAVE_IPOOL_ABI,
      functionName: "supply",
      args: [
        token.address as Hex,
        parseUnits(amount, token.decimals!),
        me!.account,
        0,
      ],
    }),
  };

  return [approve, supply];
}
