"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { smartWallet } from "@/lib/smart-wallet";
import { tokens, chains } from "@/constants";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatBalance } from "@/utils/formatBalance";

import { Fuel, Sparkles } from "lucide-react";

export const CryptoSelector = () => {
  return (
    <Select
      onValueChange={(e: any) => smartWallet.setFeeToken(e)}
      defaultValue={smartWallet.feeToken}
    >
      <SelectTrigger>
        <Fuel size={20} strokeWidth={2.5} className="mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={"eth"} key={"eth"}>
            <div className="flex flex-row items-center space-x-1">
              <div className="relative">
                <Image
                  src={`/tokens-icons/eth.svg`}
                  width={25}
                  height={25}
                  alt={"eth"}
                />
                <Image
                  src={`/chains-icons/Arbitrum Sepolia.svg`}
                  width={15}
                  height={15}
                  alt={"chainsLogo"}
                  className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
                />
                <Image
                  src={`/chains-icons/Optimism Sepolia.svg`}
                  width={15}
                  height={15}
                  alt={"chainsLogo"}
                  className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4"
                />
              </div>
              <h1>ETH</h1>
              <div className="pl-2">
                {formatBalance(
                  parseFloat(tokens["eth-arbitrumSepolia"].balance!) +
                    parseFloat(tokens["eth-optimismSepolia"].balance!),
                  4
                )}
              </div>
            </div>
          </SelectItem>
          {Object.keys(tokens).map(
            (token) =>
              "USDC" === tokens[token].coin && (
                <SelectItem value={token} key={token}>
                  <div className="flex flex-row items-center space-x-1">
                    <div className="relative">
                      <Image
                        src={`/tokens-icons/${tokens[
                          token
                        ].coin.toLowerCase()}.svg`}
                        width={25}
                        height={25}
                        alt={tokens[token].coin}
                      />
                      <Image
                        src={`/chains-icons/${
                          chains[tokens[token].network].viem.name
                        }.svg`}
                        width={15}
                        height={15}
                        alt={tokens[token].coin}
                        className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
                      />
                    </div>
                    <h1>{tokens[token].coin}</h1>
                    <div className="pl-2">
                      {formatBalance(tokens[token].allowance, 2)}
                    </div>
                  </div>
                </SelectItem>
              )
          )}
          <SelectItem value={"full"} key={"full"}>
            <div className="flex flex-row items-center space-x-1">
              <Sparkles />
              <div className="pl-1">Fully Sponsored</div>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
export default CryptoSelector;
