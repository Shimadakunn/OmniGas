"use client";
import Image from "next/image";
import React, { useState, useEffect, SetStateAction, Dispatch } from "react";
import { useBalance } from "@/providers/BalanceProvider";
import { useMe } from "@/providers/MeProvider";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { tokens, chains, contracts } from "@/constants";
import { Supply, Withdraw } from "@/lib/functions";
import {
  roundToNearestMultiple,
  determineStepSize,
} from "@/utils/roundToNiceNumber";
import { calculateVariation } from "@/utils/calculateVariation";
import { formatBalance } from "@/utils/formatBalance";

import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import {
  CircleCheckBig,
  CircleX,
  HandCoins,
  ChevronsRight,
} from "lucide-react";

export type TokenPageProps = {
  token: string;
  setVariation?: Dispatch<SetStateAction<string>>;
};

type ChartDataItem = {
  time: string;
  price: number;
};

let chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--up))",
  },
} satisfies ChartConfig;

const Token = () => {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "eth-sepolia";
  const [variation, setVariation] = useState<string>("--.--");
  const [isUp, setIsUp] = useState<boolean | null>(null);
  const { refreshBalance, balances } = useBalance();
  const [totalBalanceUSD, setTotalBalanceUSD] = useState<string>("--.--");

  useEffect(() => {
    const balance =
      parseFloat(tokens[token].balance!) * parseFloat(tokens[token].rate!);
    setTotalBalanceUSD(balance.toFixed(2));
    const interval = setInterval(() => {
      refreshBalance();
    }, 50000);
    return () => clearInterval(interval);
  }, [balances, refreshBalance, token]);

  useEffect(() => {
    if (variation !== "--.--") {
      const variationNumber = parseFloat(variation);
      setIsUp(variationNumber ? variationNumber > 0 : null);
    } else {
      setIsUp(null);
    }
  }, [variation, isUp]);
  return (
    <div className=" w-full flex items-center justify-center flex-col space-y-6">
      <div className="w-full h-32 flex items-center justify-around">
        <div className="w-full flex items-center justify-center flex-col">
          <div className="flex items-center justify-center relative">
            <Image
              src={`/tokens-icons/${tokens[token].coin.toLowerCase()}.svg`}
              width={65}
              height={65}
              alt={tokens[token].coin}
            />
            <Image
              src={`/chains-icons/${
                chains[tokens[token].network].viem.name
              }.svg`}
              width={35}
              height={35}
              alt={tokens[token].coin}
              className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
            />
          </div>
        </div>

        <Separator orientation="vertical" className="h-[75%]" />
        <div className="text-2xl font-medium w-full text-center text-white">
          <div className="flex items-center justify-center">
            <div className="text-sm text-gray-200 pt-2">$</div>
            {formatBalance(tokens[token]?.rate ?? "") || "--.--"}
          </div>

          <div className="text-xs font-base text-gray-300">Price</div>
        </div>
        <Separator orientation="vertical" className="h-[75%]" />
        {/* <div className="text-2xl font-medium w-full text-center ">
          <div
            className={`flex items-center justify-center tracking-wide ${
              isUp ? "text-green-400" : isUp === false ? "text-red-400" : null
            }`}
          >
            {isUp ? (
              <TrendingUp className="mr-1" />
            ) : isUp === false ? (
              <TrendingDown className="mr-1" />
            ) : null}
            {variation}
            {isUp !== null && "%"}
          </div>

          <div className="text-xs font-base text-gray-300">Last 24H Change</div>
        </div> */}
        <div className="text-2xl font-medium w-full text-center text-white">
          <div className="flex items-center justify-center space-x-2">
            <div className="">
              {formatBalance(tokens[token].balance ?? "") || "--.--"}
              <span className="text-lg text-violetClair">
                {" " + tokens[token].coin}
              </span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div className="">
              <span className="text-sm text-violetClair">$</span>
              {totalBalanceUSD}
            </div>
          </div>

          <div className="text-xs font-base text-gray-300">Balance</div>
        </div>
      </div>
      <LineChart token={token} setVariation={setVariation} />
      <Balance token={token} />
    </div>
  );
};

export default Token;

const LineChart = (props: TokenPageProps) => {
  const { token, setVariation } = props;
  const { refreshBalance, balances } = useBalance();
  const [priceData, setPriceData] = useState<ChartDataItem[]>([]);
  const [yAxisDomain, setYAxisDomain] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const price = await fetch(
          `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${tokens[token].coin}&tsym=USD&limit=10&api_key=${process.env.NEXT_PUBLIC_PRICE_FETCH_API}`
        );
        if (!price.ok) {
          throw new Error(`HTTP error! status: ${price.status}`);
        }
        const priceData = await price.json();
        const dataArray = priceData.Data.Data;
        const historyData: ChartDataItem[] = dataArray.map(
          (item: any, index: number) => {
            const date = new Date(item.time * 1000);
            const daysAgo = 10 - index;
            let timeLabel;

            if (index % 2 === 0) {
              if (daysAgo === 0) {
                timeLabel = "Today";
              } else {
                timeLabel = `${daysAgo}d`;
              }
            } else {
              timeLabel = "";
            }

            return {
              time: timeLabel,
              price: item.close,
            };
          }
        );

        const todayPrice = historyData[historyData.length - 1].price;
        const yesterdayPrice = historyData[historyData.length - 2].price;
        const firstDayPrice = historyData[0].price;

        setVariation
          ? setVariation(calculateVariation(yesterdayPrice, todayPrice))
          : null;

        const tenDaysVariation = parseFloat(
          calculateVariation(firstDayPrice, todayPrice)
        );

        if (tenDaysVariation < 0) {
          chartConfig.price.color = "hsl(var(--down))";
        } else {
          chartConfig.price.color = "hsl(var(--up))";
        }

        setPriceData(historyData);

        const prices = historyData.map((item) => item.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const range = maxPrice - minPrice;
        const stepSize = determineStepSize(range);
        const lowerBound = roundToNearestMultiple(
          minPrice * 0.9,
          stepSize,
          true
        );
        const upperBound = roundToNearestMultiple(
          maxPrice * 1.05,
          stepSize,
          false
        );

        setYAxisDomain([lowerBound, upperBound]);
      } catch (error) {
        console.error("Error fetching price", error);
      }
    }
    fetchPrice();
  }, [refreshBalance, balances, token, setVariation]);

  return (
    <div className="max-w-[1000px] w-full">
      <ChartContainer config={chartConfig} className="pr-2">
        <AreaChart
          accessibilityLayer
          data={priceData}
          margin={{
            right: 12,
          }}
        >
          <defs>
            <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-price)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-price)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={0}
            tickCount={5}
            domain={yAxisDomain}
            tickFormatter={(value) => {
              if (value % 1 !== 0) {
                return formatBalance(value.toFixed(2));
              } else {
                return formatBalance(value.toString());
              }
            }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            dataKey="price"
            type="natural"
            fill="url(#fillArea)"
            fillOpacity={0.7}
            stroke="var(--color-price)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

const Balance = (props: TokenPageProps) => {
  const router = useRouter();
  const { token } = props;
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

  function findContractKeyForToken(tokenKey: string): string | undefined {
    // Extract the network from the token key
    const tokenInfo = tokens[tokenKey];
    if (!tokenInfo) {
      console.error(`Token with key ${tokenKey} not found`);
      return undefined;
    }

    const network = tokenInfo.network;

    // Find the contract key that matches this network and includes the token
    for (const contractKey in contracts) {
      if (contractKey.endsWith(network)) {
        const contract = contracts[contractKey];

        // Check if the token is in the contract's tokenArray
        if (contract.tokenArray && contract.tokenArray.includes(tokenKey)) {
          return contractKey;
        }
      }
    }

    console.error(`No contract found for token ${tokenKey}`);
    return undefined;
  }

  return (
    <div className="max-w-[500px] w-full flex items-center justify-between p-4">
      <Drawer>
        <DrawerTrigger>
          <Button className="rounded-none text-lg">
            Stake / Unstake
            <HandCoins className="ml-2" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-w-[700px] w-full mx-auto py-5 px-4">
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
                        chains[tokens[token].network].viem.blockExplorers!
                          .default.url
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
                        chains[tokens[token].network].viem.blockExplorers!
                          .default.url
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
                <h1 className="text-2xl font-semibold">Supply / Withdraw</h1>
              </div>
              <div className="flex items-center justify-center relative">
                <Image
                  src={`/tokens-icons/${tokens[token].coin.toLowerCase()}.svg`}
                  width={100}
                  height={100}
                  alt={tokens[token].coin}
                />
                <Image
                  src={`/contracts-icons/${contracts[
                    findContractKeyForToken(token)!
                  ].name.toLowerCase()}.svg`}
                  width={40}
                  height={40}
                  alt={contracts[
                    findContractKeyForToken(token)!
                  ].name.toLowerCase()}
                  className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
                />
                <Image
                  src={`/chains-icons/${
                    chains[tokens[token].network].viem.name
                  }.svg`}
                  width={45}
                  height={45}
                  alt={contracts[
                    findContractKeyForToken(token)!
                  ].name.toLowerCase()}
                  className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4"
                />
              </div>
              <div className="flex items-center justify-center space-x-8 w-full">
                <Button
                  className="bg-white flex flex-col items-center justify-center px-4 py-3 cursor-pointer rounded-none h-16"
                  onClick={() =>
                    handleAmount(
                      formatBalance(tokens[token].balance!)!,
                      tokens[token].balance!,
                      tokens[token].aavebalance!
                    )
                  }
                >
                  <div className="font-semibold text-[#eb34ab] text-xs mx-2">
                    Supplyable
                  </div>
                  <div className="flex flew-row text-[#eb34ab]">
                    <h1 className="text-xl">
                      {formatBalance(tokens[token].balance!)?.split(".")[0]}
                    </h1>
                    <h1 className="text-xs items-start pt-2">
                      {formatBalance(tokens[token].balance!)?.split(".")[1] &&
                        "." +
                          formatBalance(tokens[token].balance!)!.split(".")[1]}
                    </h1>
                    <h1 className="text-sm pt-[0.375rem] ml-1">
                      {tokens[token].coin}
                    </h1>
                  </div>
                </Button>
                <Button
                  className="bg-white flex flex-col items-center justify-center px-4 rounded-none h-16"
                  variant="noShadow"
                >
                  <div className="font-semibold text-xs ">APY</div>
                  <div className="text-xl">12%</div>
                </Button>
                <Button
                  className=" bg-white text-[#34ebcf] flex flex-col items-center justify-center px-4 py-3 rounded-none h-16"
                  onClick={() =>
                    handleAmount(
                      formatBalance(tokens[token].aavebalance!)!,
                      tokens[token].balance!,
                      tokens[token].aavebalance!
                    )
                  }
                >
                  <div className="font-semibold text-xs">Withdrawable</div>
                  <div className="flex flew-row">
                    <h1 className="text-xl">
                      {formatBalance(tokens[token].aavebalance!)?.split(".")[0]}
                    </h1>
                    <h1 className="text-xs items-start pt-2 ">
                      {formatBalance(tokens[token].aavebalance!)?.split(
                        "."
                      )[1] &&
                        "." +
                          formatBalance(tokens[token].aavebalance!)!.split(
                            "."
                          )[1]}
                    </h1>
                    <h1 className=" text-sm pt-[0.375rem] ml-1">
                      {tokens[token].coin}
                    </h1>
                  </div>
                </Button>
              </div>
              {/* Input */}
              <div className="relative">
                <div className="absolute top-2 left-5 text-xs">
                  Interact with
                </div>
                <Input
                  className="h-[10vh] w-[30vw] text-4xl rounded-lg"
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
                        contracts[findContractKeyForToken(token)!],
                        tokens[token],
                        me!,
                        userInputAmount,
                        setIsLoading,
                        refreshBalance,
                        setError
                      )
                    )
                  }
                  className="w-40 text-lg rounded-none bg-white text-[#eb34ab]"
                  disabled={!isBelowBalance}
                >
                  {isLoading ? <Spinner /> : "Supply"}
                </Button>
                <Button
                  onClick={async () =>
                    setTxReceipt(
                      await Withdraw(
                        contracts[findContractKeyForToken(token)!],
                        tokens[token],
                        me!,
                        userInputAmount,
                        setIsLoading,
                        refreshBalance,
                        setError
                      )
                    )
                  }
                  className="w-40 text-lg rounded-none bg-white text-[#34ebcf]"
                  disabled={!isBelowAaveBalance}
                >
                  {isLoading ? <Spinner /> : "Withdraw"}
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
      <Button
        className="rounded-none text-lg"
        onClick={() => router.push(`/send?token=${token}`)}
      >
        Send
        <ChevronsRight className="ml-2" />
      </Button>
    </div>
  );
};
