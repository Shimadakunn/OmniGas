"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { tokens, chains, contracts } from "@/constants";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";

import { Supply, Withdraw } from "@/lib/functions";
import { formatBalance } from "@/utils/formatBalance";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";
import { ScrollArea } from "@/components/ui/scroll-area";

import { CircleCheckBig, CircleX, CircleArrowOutUpRight } from "lucide-react";

const Finance = () => {
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [userInputAmount, setUserInputAmount] = useState<string>("");
  const [isBelowBalance, setIsBelowBalance] = useState(false);
  const [isBelowAaveBalance, setIsBelowAaveBalance] = useState(false);

  const { me, chain } = useMe();
  const { refreshBalance } = useBalance();

  useEffect(() => {
    if (txReceipt) {
      const timer = setTimeout(() => {
        setTxReceipt(null);
        setError(null);
        setUserInputAmount("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [txReceipt]);

  function handleUserInputAmount(e: any, balance: string, aavebalance: string) {
    const value = e.target.value;
    const amount = Number(value);
    if ((amount > Number(balance) && value !== "") || value === "") {
      setIsBelowBalance(false);
    }
    if (amount <= Number(balance) && value !== "") {
      setIsBelowBalance(true);
    }
    if ((amount > Number(aavebalance) && value !== "") || value === "") {
      setIsBelowAaveBalance(false);
    }
    if (amount <= Number(aavebalance) && value !== "") {
      setIsBelowAaveBalance(true);
    }
    if (amount === 0 || amount < 0) {
      setIsBelowBalance(false);
      setIsBelowAaveBalance(false);
    }
    setUserInputAmount(value);
  }

  function handleAmount(input: string, balance: string, aavebalance: string) {
    const amount = Number(input);
    if ((amount > Number(balance) && input !== "") || input === "") {
      setIsBelowBalance(false);
    }
    if (amount <= Number(balance) && input !== "") {
      setIsBelowBalance(true);
    }
    if ((amount > Number(aavebalance) && input !== "") || input === "") {
      setIsBelowAaveBalance(false);
    }
    if (amount <= Number(aavebalance) && input !== "") {
      setIsBelowAaveBalance(true);
    }
    if (amount === 0 || amount < 0) {
      setIsBelowBalance(false);
      setIsBelowAaveBalance(false);
    }
    setUserInputAmount(input);
  }

  return (
    <ScrollArea className="h-[50vh] w-full flex items-center justify-start flex-col px-4">
      <div className="border-b-0 border-primary/30 w-full mb-1 h-10 flex items-center justify-between p-4 bg-secondary/10 hover:bg-secondary/20 cursor-pointer active:bg-secondary/20 transition-all duration-200 ease-in-out rounded-3xl">
        <div className="flex items-center justify-center w-20 text-xs text-primary/60">
          Protocol
        </div>
        <div className="flex items-center justify-center w-16 text-xs text-primary/60 pr-2">
          Supplyable
        </div>
        <div className="flex items-center justify-center w-16 text-xs text-primary/60 pl-2">
          Withdrawable
        </div>
        <div className="flex items-center justify-center w-20 text-xs text-primary/60">
          Interact
        </div>
      </div>
      <div className="h-full w-full flex items-center justify-start flex-col space-y-1">
        {Object.keys(contracts).map((contract) =>
          contracts[contract].tokenArray?.map(
            (token) =>
              (chain === chains[tokens[token].network].viem ||
                chain === undefined) && (
                <div
                  key={token}
                  className="w-full h-16 flex items-center justify-between p-4 bg-secondary/15 hover:bg-secondary/20 cursor-pointer active:bg-secondary/20 transition-all duration-200 ease-in-out rounded-3xl"
                >
                  <div className="flex items-center justify-start w-20">
                    <div className="flex items-center justify-center relative mr-2">
                      <Image
                        src={`/tokens-icons/${tokens[
                          token
                        ].coin.toLowerCase()}.svg`}
                        width={30}
                        height={30}
                        alt={tokens[token].coin}
                      />
                      <Image
                        src={`/contracts-icons/${contracts[
                          contract
                        ].name.toLowerCase()}.svg`}
                        width={15}
                        height={15}
                        alt={contracts[contract].name.toLowerCase()}
                        className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
                      />
                      <Image
                        src={`/chains-icons/${
                          chains[tokens[token].network].viem.name
                        }.svg`}
                        width={17}
                        height={17}
                        alt={contracts[contract].name.toLowerCase()}
                        className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4"
                      />
                    </div>
                    <h1 className="text-lg">{tokens[token].coin}</h1>
                  </div>
                  <div className="flex items-center justify-center w-16">
                    <h1 className="text-2xl">
                      {formatBalance(tokens[token].balance!)?.split(".")[0]}
                    </h1>
                    <h1 className="text-xs items-start pt-2 text-primary/80">
                      {formatBalance(tokens[token].balance!)?.split(".")[1] &&
                        "." +
                          formatBalance(tokens[token].balance!)!.split(".")[1]}
                    </h1>
                  </div>
                  <div className="flex items-center justify-center w-16">
                    <h1 className="text-2xl">
                      {formatBalance(tokens[token].aavebalance!)?.split(".")[0]}
                    </h1>
                    <h1 className="text-xs items-start pt-2 text-primary/80">
                      {formatBalance(tokens[token].aavebalance!)?.split(
                        "."
                      )[1] &&
                        "." +
                          formatBalance(tokens[token].aavebalance!)!.split(
                            "."
                          )[1]}
                    </h1>
                  </div>
                  <Drawer>
                    <DrawerTrigger>
                      <Button className="w-20">Interact</Button>
                    </DrawerTrigger>
                    <DrawerContent className="py-5 px-4 max-w-[600px]">
                      {error && !isLoading && (
                        <div className="w-full h-[60vh] flex items-center justify-center">
                          <div className="flex items-center">
                            <CircleX className="text-destructive mr-1" />
                            An error occurred! Please try again.
                          </div>
                        </div>
                      )}
                      {isLoading && (
                        <div className="flex h-[60vh] items-center justify-center">
                          <div className="flex items-center space-x-1">
                            <Spinner />
                            Sending Transaction...
                          </div>
                        </div>
                      )}
                      {txReceipt && !isLoading && !error && (
                        <div className="w-full h-[60vh] flex items-center justify-center">
                          {true ? (
                            <Button
                              variant={"link"}
                              onClick={() =>
                                window.open(
                                  `${
                                    chains[tokens[token].network].viem
                                      .blockExplorers!.default.url
                                  }/tx/${txReceipt?.receipt?.transactionHash}`,
                                  "blank"
                                )
                              }
                            >
                              <CircleCheckBig className="text-secondary mr-1" />
                              Transaction Successful!
                            </Button>
                          ) : (
                            <Button
                              variant={"link"}
                              onClick={() =>
                                window.open(
                                  `${
                                    chains[tokens[token].network].viem
                                      .blockExplorers!.default.url
                                  }/tx/${txReceipt?.receipt?.transactionHash}`,
                                  "blank"
                                )
                              }
                            >
                              <CircleX className="text-destructive mr-1" />
                              Transaction Failed!
                            </Button>
                          )}
                        </div>
                      )}
                      {!isLoading && !txReceipt && (
                        <div className="w-full h-[60vh] flex items-center justify-between space-y-4 flex-col">
                          <div className="pt-8 flex items-center flex-col w-full space-y-4">
                            <h1 className="text-2xl font-semibold">
                              Supply / Withdraw
                            </h1>
                          </div>
                          <div className="flex items-center justify-center relative">
                            <Image
                              src={`/tokens-icons/${tokens[
                                token
                              ].coin.toLowerCase()}.svg`}
                              width={100}
                              height={100}
                              alt={tokens[token].coin}
                            />
                            <Image
                              src={`/contracts-icons/${contracts[
                                contract
                              ].name.toLowerCase()}.svg`}
                              width={40}
                              height={40}
                              alt={contracts[contract].name.toLowerCase()}
                              className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
                            />
                            <Image
                              src={`/chains-icons/${
                                chains[tokens[token].network].viem.name
                              }.svg`}
                              width={45}
                              height={45}
                              alt={contracts[contract].name.toLowerCase()}
                              className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4"
                            />
                          </div>
                          <div className="flex items-center justify-center space-x-4 w-full">
                            <div
                              className="rounded-xl bg-secondary/10 flex flex-col items-center justify-center px-4 py-3 cursor-pointer"
                              onClick={() =>
                                handleAmount(
                                  formatBalance(tokens[token].balance!)!,
                                  tokens[token].balance!,
                                  tokens[token].aavebalance!
                                )
                              }
                            >
                              <div className="font-semibold text-card text-xs mx-2">
                                Supplyable
                              </div>
                              <div className="flex flew-row">
                                <h1 className="text-xl">
                                  {
                                    formatBalance(
                                      tokens[token].balance!
                                    )?.split(".")[0]
                                  }
                                </h1>
                                <h1 className="text-xs items-start pt-2 text-card/50">
                                  {formatBalance(tokens[token].balance!)?.split(
                                    "."
                                  )[1] &&
                                    "." +
                                      formatBalance(
                                        tokens[token].balance!
                                      )!.split(".")[1]}
                                </h1>
                                <h1 className="text-card/70 text-sm pt-[0.375rem] ml-1">
                                  {tokens[token].coin}
                                </h1>
                              </div>
                            </div>
                            <div className="rounded-xl bg-secondary/10 flex flex-col items-center justify-center px-4 cursor-pointer aspect-square">
                              <div className="font-semibold text-card text-xs ">
                                APY
                              </div>
                              <div className="text-xl">12%</div>
                            </div>
                            <div
                              className="rounded-xl bg-secondary/10 flex flex-col items-center justify-center px-4 py-3 cursor-pointer"
                              onClick={() =>
                                handleAmount(
                                  formatBalance(tokens[token].aavebalance!)!,
                                  tokens[token].balance!,
                                  tokens[token].aavebalance!
                                )
                              }
                            >
                              <div className="font-semibold text-card text-xs">
                                Withdrawable
                              </div>
                              <div className="flex flew-row">
                                <h1 className="text-xl">
                                  {
                                    formatBalance(
                                      tokens[token].aavebalance!
                                    )?.split(".")[0]
                                  }
                                </h1>
                                <h1 className="text-xs items-start pt-2 text-card/50">
                                  {formatBalance(
                                    tokens[token].aavebalance!
                                  )?.split(".")[1] &&
                                    "." +
                                      formatBalance(
                                        tokens[token].aavebalance!
                                      )!.split(".")[1]}
                                </h1>
                                <h1 className="text-card/70 text-sm pt-[0.375rem] ml-1">
                                  {tokens[token].coin}
                                </h1>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute top-2 left-5 text-card text-xs">
                              Interact with
                            </div>
                            <Input
                              className="h-[12vh] w-[30vw] text-4xl"
                              placeholder="0"
                              type="number"
                              value={userInputAmount}
                              onChange={(e) =>
                                handleUserInputAmount(
                                  e,
                                  tokens[token].balance!,
                                  tokens[token].aavebalance!
                                )
                              }
                            />
                            <div className="flex space-x-1 items-center justify-center absolute top-1/2 right-4 -translate-y-1/2 text-2xl">
                              <h1 className="text-primary/80 text-lg">
                                {tokens[token].coin!}
                              </h1>
                              {isBelowBalance || isBelowAaveBalance ? (
                                <CircleCheckBig className="text-secondary" />
                              ) : userInputAmount === "" ? (
                                <CircleX className="text-transparent" />
                              ) : (
                                <CircleX className="text-destructive/60" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-around w-full">
                            <Button
                              onClick={async () =>
                                setTxReceipt(
                                  await Supply(
                                    contracts[contract],
                                    tokens[token],
                                    me!,
                                    userInputAmount,
                                    setIsLoading,
                                    refreshBalance,
                                    setError
                                  )
                                )
                              }
                              className="w-40 bg-accent/60 text-lg"
                              disabled={!isBelowBalance}
                            >
                              {isLoading ? <Spinner /> : "Supply"}
                            </Button>
                            <Button
                              onClick={async () =>
                                await Withdraw(
                                  contracts[contract],
                                  tokens[token],
                                  me!,
                                  userInputAmount,
                                  setIsLoading,
                                  refreshBalance,
                                  setError
                                )
                              }
                              className="w-40 text-lg"
                              disabled={!isBelowAaveBalance}
                            >
                              {isLoading ? <Spinner /> : "Withdraw"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DrawerContent>
                  </Drawer>
                </div>
              )
          )
        )}
        <div></div>
      </div>
    </ScrollArea>
  );
};

export default Finance;
