"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

import { tokens, chains } from "@/constants";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";

import { formatBalance } from "@/utils/formatBalance";

import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const { refreshBalance } = useBalance();
  const { chain } = useMe();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshBalance();
    }, 50000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollArea className="h-[50vh] w-full">
      <div className="w-full h-full flex items-center justify-start flex-col space-y-2 px-2">
        {Object.keys(tokens)
          .sort(
            (a, b) =>
              parseFloat(tokens[b].balance!) * parseFloat(tokens[b].rate!) -
              parseFloat(tokens[a].balance!) * parseFloat(tokens[a].rate!)
          )
          .map(
            (key) =>
              (chain === chains[tokens[key].network].viem ||
                chain === undefined) && (
                <div
                  key={key}
                  className="w-[50%] h-20 flex items-center justify-between px-4 bg-main hover:bg-white/80 border-2  cursor-pointer active:bg-background transition-all duration-200 ease-in-out"
                  onClick={() => {
                    router.push("/token?token=" + key);
                  }}
                >
                  <div className="flex items-center justify-start">
                    <div className="flex items-center justify-center relative mr-2">
                      <Image
                        src={`/tokens-icons/${tokens[
                          key
                        ].coin.toLowerCase()}.svg`}
                        width={35}
                        height={35}
                        alt={tokens[key].coin}
                      />
                      <Image
                        src={`/chains-icons/${
                          chains[tokens[key].network].viem.name
                        }.svg`}
                        width={22}
                        height={22}
                        alt={tokens[key].coin}
                        className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
                      />
                    </div>
                    <h1 className="text-lg">{tokens[key].name}</h1>
                  </div>
                  <div className="flex items-center">
                    <h1 className="text-2xl ">
                      {formatBalance(tokens[key].balance!)?.split(".")[0]}
                    </h1>
                    <h1 className="text-lg items-start pt-1 ">
                      {formatBalance(tokens[key].balance!)?.split(".")[1] &&
                        "." +
                          formatBalance(tokens[key].balance!)!.split(".")[1]}
                    </h1>
                    <h1 className="text-sm ml-1 w-10 text-center">
                      {tokens[key].coin}
                    </h1>
                  </div>
                </div>
              )
          )}
      </div>
    </ScrollArea>
  );
}
