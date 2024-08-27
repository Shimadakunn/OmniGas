"use client";
import Image from "next/image";
import React, { useState, useEffect, SetStateAction, Dispatch } from "react";
import { useBalance } from "@/providers/BalanceProvider";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Separator } from "@/components/ui/separator";

import { chains, tokens } from "@/constants";
import {
  roundToNearestMultiple,
  determineStepSize,
} from "@/utils/roundToNiceNumber";
import { calculateVariation } from "@/utils/calculateVariation";
import { formatBalance } from "@/utils/formatBalance";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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

export const TokenPage = () => {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "eth-sepolia";
  const [variation, setVariation] = useState<string>("--.--");
  const [isUp, setIsUp] = useState<boolean | null>(null);

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
        <div className="text-2xl font-medium w-full text-center">
          <div className="flex items-center justify-center">
            <div className="text-lg text-gray-400 mr-[0.1rem]">$</div>
            {formatBalance(tokens[token]?.rate ?? "") || "--.--"}
          </div>

          <div className="text-xs font-base text-gray-500">
            {tokens[token].name!} Price
          </div>
        </div>
        <Separator orientation="vertical" className="h-[75%]" />
        <div className="text-2xl font-medium w-full text-center ">
          <div
            className={`flex items-center justify-center tracking-wide ${
              isUp ? "text-green-500" : isUp === false ? "text-red-500" : null
            }`}
          >
            {/* {isUp ? "▲" : isUp === false ? "▼" : null} */}
            {isUp ? (
              <TrendingUp className="mr-1" />
            ) : isUp === false ? (
              <TrendingDown className="mr-1" />
            ) : null}
            {variation}
            {isUp !== null && "%"}
          </div>

          <div className="text-xs font-base text-gray-500">Last 24H Change</div>
        </div>
      </div>
      <LineChart token={token} setVariation={setVariation} />
      <Balance token={token} />
    </div>
  );
};

export default TokenPage;

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
    <div className="w-full">
      <div className="w-full flex flex-col items-center justify-center mb-2">
        <div className="text-base text-gray-400 font-semibold">
          {tokens[token].name!} - Price Evolution
        </div>
        <div className="text-xs text-gray-500 ml-2">Last 10 days</div>
      </div>
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

  return (
    <div className="border w-[85%] rounded-xl">
      <div className=" w-full h-[12vh] flex items-center justify-between px-4 py-2">
        <div>
          <h1 className="text-xl text-gray-400 font-semibold">Total Balance</h1>
          <h1 className=" text-secondary font-semibold ml-1">
            {tokens[token].balance} {tokens[token].coin}
          </h1>
        </div>
        <h1 className="text-4xl font-medium flex items-center">
          <div className="text-2xl text-gray-500 mr-[0.1rem]">$</div>
          {totalBalanceUSD}
        </h1>
      </div>
      <div className="border-t w-full h-[8vh] flex items-center justify-between">
        <button
          className="w-full h-full border-r text-lg text-secondary rounded-bl-xl hover:bg-secondary/20"
          onClick={() => router.push(`/trade?from=${token}`)}
        >
          Sell
        </button>
        <button
          className="w-full h-full text-lg text-primary rounded-br-xl hover:bg-primary/20"
          onClick={() => router.push(`/trade?to=${token}`)}
        >
          Buy
        </button>
      </div>
    </div>
  );
};
