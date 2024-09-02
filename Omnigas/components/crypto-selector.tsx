"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { tokens, chains } from "@/constants";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMe } from "@/providers/MeProvider";

import { formatBalance } from "@/utils/formatBalance";

import { Fuel } from "lucide-react";

export const CryptoSelector = () => {
  const { feeToken, switchFeeToken } = useMe();
  return (
    <Select
      onValueChange={(e: any) => switchFeeToken(e)}
      defaultValue={feeToken}
    >
      <SelectTrigger>
        <Fuel size={20} strokeWidth={2.5} className="mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.keys(tokens).map((token) => (
            // "USDC" === tokens[token].coin && (
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
                  {formatBalance(tokens[token].balance, 2)}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
export default CryptoSelector;
