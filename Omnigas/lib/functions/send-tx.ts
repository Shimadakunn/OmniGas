import { Chain, EstimateFeesPerGasReturnType, Hash, Hex, parseEther, parseUnits,encodeFunctionData, Address } from "viem";
import { smartWallet } from "@/lib/smart-wallet";
import { useEffect, useRef, useState } from "react";
import { UserOpBuilder, emptyHex } from "@/lib/smart-wallet/service/userOps";
import { useBalance } from "@/providers/BalanceProvider";
import { useMe } from "@/providers/MeProvider";

import { chains, contracts, tokens, ChainType, ContractType, TokenType,AAVE_ABI,ERC20_ABI,AAVE_IPOOL_ABI } from "@/constants";

const builder = new UserOpBuilder();

type Me = {account: Address;keyId: Hex;pubKey: {x: Hex;y: Hex;};};

export async function SendTx(token: TokenType, me: Me, amount: string, destination: string ,setIsLoading: (loading: boolean) => void, refreshBalance: Function,setError: (error: any) => void) {

    setIsLoading(true);
    try {
        smartWallet.init(chains[token.network])
        builder.init(chains[token.network])

        const { maxFeePerGas, maxPriorityFeePerGas }: EstimateFeesPerGasReturnType = await smartWallet.client.estimateFeesPerGas();

        let value= parseEther(amount);
        let calls = [
            {
              dest: destination.toLowerCase() as Hex,
              value,
              data: emptyHex,
            }
          ]
        if(token.address){
          console.log("sending Erc20")
          value = parseEther("0");
          calls = SendErc20(token,me,amount,destination);
        }
        else{
          console.log("sending Eth")
        }

        const userOp = await builder.buildUserOp({
          calls,
          maxFeePerGas: maxFeePerGas as bigint,
          // maxPriorityFeePerGas: BigInt(5_000_000) as bigint,
          maxPriorityFeePerGas: maxPriorityFeePerGas as bigint,
          keyId: me?.keyId as Hex,
        });
        console.log("userOp", userOp)
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

function SendErc20(token: TokenType, me:Me, amount: string, destination: string) {
  const approve = {
    dest: token.address as Hex,
    value: parseEther("0"),
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [destination as Hex, parseUnits(amount,token.decimals!)],
    }),
  };
  return [approve];
} 