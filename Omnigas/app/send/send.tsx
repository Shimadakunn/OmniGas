"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { tokens, chains } from "@/constants";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";

import { SendTx } from "@/lib/functions";
import { formatBalance } from "@/utils/formatBalance";

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

  const [Token, setToken] = useState<string>("");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [isBelowBalance, setIsBelowBalance] = useState(false);

  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [isAddressValid, setIsAddressValid] = useState(false);

  const { me, chain } = useMe();
  const { refreshBalance } = useBalance();

  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token]);

  useEffect(() => {
    if (txReceipt) {
      const timer = setTimeout(() => {
        setTxReceipt(null);
        setError(null);
        setDestinationAddress("");
        setInputAmount("");
        setIsBelowBalance(false);
        setIsAddressValid(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [txReceipt]);

  useEffect(() => {
    setToken("");
    setInputAmount("");
    setIsBelowBalance(false);
  }, [chain]);

  useEffect(() => {
    setInputAmount("");
    setIsBelowBalance(false);
  }, [Token]);

  function handleInputAmount(
    e: any,
    token: string,
    setBelow: any,
    setAmount: any
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

  function handleDestinationAddress(e: any) {
    const address = e.target.value;
    if (address === "") {
      setDestinationAddress("");
      setIsAddressValid(false);
    }
    if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
      setDestinationAddress(address);
      setIsAddressValid(true);
    } else {
      setIsAddressValid(false);
      setDestinationAddress(e.target.value);
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center flex-col px-4 ">
      <div className="relative">
        <div className="absolute top-3 left-5 font-semibold text-card text-sm">
          Address
        </div>
        <Input
          className="h-[12vh] w-[80vw] text-3xl"
          placeholder="0x..."
          type="string"
          value={destinationAddress}
          onChange={(e) => {
            handleDestinationAddress(e);
          }}
        />
        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-2xl flex items-center space-x-2 ">
          {isAddressValid ? (
            <div className="bg-background rounded-full p-1">
              <CircleCheckBig className="text-secondary" />
            </div>
          ) : destinationAddress === "" ? (
            <CircleX className="text-transparent" />
          ) : (
            <div className="bg-background rounded-full p-1">
              <CircleX className="text-destructive/60" />
            </div>
          )}
        </div>
      </div>
      <div className="p-[2px] rounded-full bg-white scale-[3] z-10 border">
        <CircleChevronDown width={10} height={10} className="" />
      </div>
      <div className="relative">
        <div className="absolute top-3 left-5 font-semibold text-card text-sm">
          Amount
        </div>
        <Input
          className="h-[12vh] w-[80vw] text-3xl"
          placeholder="0"
          type="number"
          value={inputAmount}
          onChange={(e) => {
            if (Token) {
              handleInputAmount(e, Token, setIsBelowBalance, setInputAmount);
            }
          }}
        />
        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-2xl flex items-center space-x-2">
          {isBelowBalance ? (
            <CircleCheckBig className="text-secondary" />
          ) : inputAmount === "" ? (
            <CircleX className="text-transparent" />
          ) : (
            <CircleX className="text-destructive/60" />
          )}
          {chain !== undefined &&
            Object.keys(chains).map(
              (key) =>
                (chain === chains[key].viem || chain === undefined) && (
                  <Select key={key} onValueChange={(e: any) => setToken(e)}>
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
            <Select onValueChange={(e: any) => setToken(e)}>
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
                              <div className="pl-2">
                                {tokens[token].balance}
                              </div>
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
              formatBalance(tokens[Token].balance!)!,
              tokens[Token].balance!,
              setIsBelowBalance,
              setInputAmount
            )
          }
        >
          <h1 className="text-primary/80">
            {Token && formatBalance(tokens[Token].balance!)?.split(".")[0]}
          </h1>
          <h1 className="text-[0.7rem] leading-4 items-start text-primary/60">
            {Token &&
              formatBalance(tokens[Token].balance!)?.split(".")[1] &&
              "." + formatBalance(tokens[Token].balance!)!.split(".")[1]}
          </h1>
          <h1 className="text-primary/80 text-xs ml-1">
            {Token && tokens[Token].coin!}
          </h1>
          <h1 className="text-card text-xs ml-1">{Token && "Max"}</h1>
        </div>
      </div>
      {error && !isLoading && (
        <div className="flex items-center">
          <CircleX className="text-destructive mr-1" />
          An error occurred! Please try again.
        </div>
      )}
      {isLoading && (
        <>
          <Spinner />
          <span className="ml-1">Sending Transaction...</span>
        </>
      )}
      {txReceipt && !isLoading && !error && (
        <div className="w-full flex items-center justify-center">
          {true ? (
            <Button
              variant={"link"}
              onClick={() =>
                window.open(
                  `${
                    chains[tokens[Token].network].viem.blockExplorers!.default
                      .url
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
                    chains[tokens[Token].network].viem.blockExplorers!.default
                      .url
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
        <Button
          disabled={!inputAmount || !destinationAddress || !Token}
          className="mt-4 rounded-none text-lg"
          onClick={async () =>
            setTxReceipt(
              await await SendTx(
                tokens[Token],
                me!,
                inputAmount,
                destinationAddress,
                setIsLoading,
                refreshBalance,
                setError
              )
            )
          }
        >
          Send
        </Button>
      )}
    </div>
  );
};

export default Trade;
