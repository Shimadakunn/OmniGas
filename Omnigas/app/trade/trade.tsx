"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";

import { tokens, chains, contracts } from "@/constants";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";

import {
  Chain,
  EstimateFeesPerGasReturnType,
  Hash,
  Hex,
  parseEther,
  encodeFunctionData,
} from "viem";
import { smartWallet } from "@/lib/smart-wallet";
import { UserOpBuilder, emptyHex } from "@/lib/smart-wallet/service/userOps";
import { sepolia, mainnet, arbitrumSepolia } from "viem/chains";
import { normalize } from "viem/ens";

import { Supply, Withdraw } from "@/lib/functions";
import { formatBalance } from "@/utils/formatBalance";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";

import { CircleCheckBig, CircleX, CircleChevronDown } from "lucide-react";

const Trade = () => {
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const [fromToken, setFromToken] = useState<string>("");
  const [fromInputAmount, setFromInputAmount] = useState<string>("");
  const [isFromBelowBalance, setIsFromBelowBalance] = useState(false);

  const [toToken, setToToken] = useState<string>("");
  const [toInputAmount, setToInputAmount] = useState<string>("");
  const [isToBelowBalance, setIsToBelowBalance] = useState(false);

  const { me, chain } = useMe();
  const { refreshBalance } = useBalance();

  useEffect(() => {
    setFromToken("");
    setFromInputAmount("");
    setIsFromBelowBalance(false);

    setToInputAmount("");
    setToToken("");
    setIsToBelowBalance(false);
  }, [chain]);

  useEffect(() => {
    setFromInputAmount("");
    setIsFromBelowBalance(false);
  }, [fromToken]);

  useEffect(() => {
    setToInputAmount("");
    setIsToBelowBalance(false);
  }, [toToken]);

  function handleInputAmount(
    e: any,
    token: string,
    token2: string,
    setBelow: any,
    setAmount: any,
    setAmount2: any
  ) {
    const balance = tokens[token].balance!;
    const value = e.target.value;
    const amount = Number(value);
    if ((amount > Number(balance) && value !== "") || value === "") {
      setBelow(false);
    }
    if (amount <= Number(balance) && value !== "") {
      setBelow(true);
    }
    if (amount === 0 || amount < 0) {
      setBelow(false);
    }
    setAmount(value);
    if (token2) {
      setAmount2(
        ((value * Number(tokens[token].rate!)) / Number(tokens[token2].rate!))
          .toString()
          .slice(0, 8)
      );
    }
    if (value === "") {
      setAmount2("");
    }
  }

  function handleAmount(
    input: string,
    balance: string,
    setBelow: any,
    setAmount: any
  ) {
    const amount = Number(input);
    if ((amount > Number(balance) && input !== "") || input === "") {
      setBelow(false);
    }
    if (amount <= Number(balance) && input !== "") {
      setBelow(true);
    }
    if (amount === 0 || amount < 0) {
      setBelow(false);
    }
    setAmount(input);
  }

  return (
    <div className="h-full w-full flex items-center justify-center flex-col px-4">
      <div className="relative">
        <Input
          className="h-[12vh] w-[80vw] text-3xl"
          placeholder="0"
          type="number"
          value={fromInputAmount}
          onChange={(e) => {
            if (fromToken) {
              handleInputAmount(
                e,
                fromToken,
                toToken,
                setIsFromBelowBalance,
                setFromInputAmount,
                setToInputAmount
              );
            }
          }}
        />
        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-2xl flex items-center space-x-2">
          {isFromBelowBalance ? (
            <CircleCheckBig className="text-secondary" />
          ) : fromInputAmount === "" ? (
            <CircleX className="text-transparent" />
          ) : (
            <CircleX className="text-destructive/60" />
          )}
          {chain !== undefined &&
            Object.keys(chains).map(
              (key) =>
                (chain === chains[key].viem || chain === undefined) && (
                  <Select key={key} onValueChange={(e: any) => setFromToken(e)}>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.keys(tokens).map(
                          (token) =>
                            chains[key].viem ===
                              chains[tokens[token].network].viem && (
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
                                </div>
                              </SelectItem>
                            )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )
            )}
          {chain === undefined && (
            <Select onValueChange={(e: any) => setFromToken(e)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(chains).map((key) => (
                  <SelectGroup key={key}>
                    <SelectLabel className="flex items-center">
                      <Image
                        src={`/chains-icons/${chains[key].viem.name}.svg`}
                        width={30}
                        height={20}
                        alt={chains[key].viem.name}
                        className="mr-1"
                      />
                      <div className="">{chains[key].viem.name}</div>
                    </SelectLabel>
                    {Object.keys(tokens).map(
                      (token) =>
                        chains[key].viem ===
                          chains[tokens[token].network].viem && (
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
                            </div>
                          </SelectItem>
                        )
                    )}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div
          className="absolute bottom-0 right-4 -translate-y-1/4 flex items-center"
          onClick={() =>
            handleAmount(
              formatBalance(tokens[fromToken].balance!)!,
              tokens[fromToken].balance!,
              setIsFromBelowBalance,
              setFromInputAmount
            )
          }
        >
          <h1 className="text-primary/80">
            {fromToken &&
              formatBalance(tokens[fromToken].balance!)?.split(".")[0]}
          </h1>
          <h1 className="text-xs items-start text-primary/60">
            {fromToken &&
              formatBalance(tokens[fromToken].balance!)?.split(".")[1] &&
              "." + formatBalance(tokens[fromToken].balance!)!.split(".")[1]}
          </h1>
          <h1 className="text-primary/80 text-xs ml-1">
            {fromToken && tokens[fromToken].coin!}
          </h1>
          <h1 className="text-card text-xs ml-1">{fromToken && "Max"}</h1>
        </div>
      </div>
      <div className="p-[2px] rounded-full bg-background scale-[3] z-10">
        <CircleChevronDown width={10} height={10} className="text-card/60" />
      </div>
      <div className="relative">
        <Input
          className="h-[12vh] w-[80vw] text-3xl"
          placeholder="0"
          type="number"
          value={toInputAmount}
          onChange={(e) => {
            if (toToken) {
              handleInputAmount(
                e,
                toToken,
                fromToken,
                setIsToBelowBalance,
                setToInputAmount,
                setFromInputAmount
              );
            }
          }}
        />
        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-2xl flex items-center space-x-2">
          {chain !== undefined &&
            Object.keys(chains).map(
              (key) =>
                (chain === chains[key].viem || chain === undefined) && (
                  <Select key={key} onValueChange={(e: any) => setToToken(e)}>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.keys(tokens)
                          .filter((token) => token !== fromToken)
                          .map(
                            (token) =>
                              chains[key].viem ===
                                chains[tokens[token].network].viem && (
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
                                          chains[tokens[token].network].viem
                                            .name
                                        }.svg`}
                                        width={15}
                                        height={15}
                                        alt={tokens[token].coin}
                                        className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
                                      />
                                    </div>
                                    <h1>{tokens[token].coin}</h1>
                                  </div>
                                </SelectItem>
                              )
                          )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )
            )}
          {chain === undefined && (
            <Select onValueChange={(e: any) => setToToken(e)}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(chains).map((key) => (
                  <SelectGroup key={key}>
                    <SelectLabel className="flex items-center">
                      <Image
                        src={`/chains-icons/${chains[key].viem.name}.svg`}
                        width={30}
                        height={20}
                        alt={chains[key].viem.name}
                        className="mr-1"
                      />
                      <div className="">{chains[key].viem.name}</div>
                    </SelectLabel>
                    {Object.keys(tokens)
                      .filter((token) => token !== fromToken)
                      .map(
                        (token) =>
                          chains[key].viem ===
                            chains[tokens[token].network].viem && (
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
                              </div>
                            </SelectItem>
                          )
                      )}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div
          className="absolute bottom-0 right-5 -translate-y-1/4 flex items-center"
          onClick={() =>
            handleAmount(
              formatBalance(tokens[toToken].balance!)!,
              tokens[toToken].balance!,
              setIsToBelowBalance,
              setToInputAmount
            )
          }
        >
          <h1 className="text-primary/80">
            {toToken && formatBalance(tokens[toToken].balance!)?.split(".")[0]}
          </h1>
          <h1 className="text-xs items-start text-primary/60">
            {toToken &&
              formatBalance(tokens[toToken].balance!)?.split(".")[1] &&
              "." + formatBalance(tokens[toToken].balance!)!.split(".")[1]}
          </h1>
          <h1 className="text-primary/80 text-xs ml-1">
            {toToken && tokens[toToken].coin!}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Trade;
