"use client";
import { useEffect, useState } from "react";

import { tokens, chains, contracts } from "@/constants";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";

const GlobalBalance = () => {
  const { refreshBalance } = useBalance();
  const { chain } = useMe();

  const [totalBalanceUSD, setTotalBalanceUSD] = useState<string>("--.--");

  useEffect(() => {
    const calculateTotalBalance = () => {
      const totalArray = Object.keys(contracts).map(
        (contract) =>
          contracts[contract].tokenArray
            ?.filter(
              (key) =>
                chain === undefined ||
                chains[tokens[key].network].viem === chain
            )
            .map(
              (key) =>
                parseFloat(tokens[key].aavebalance!) *
                parseFloat(tokens[key].rate!)
            )
            .reduce((acc, product) => acc + product, 0) || 0
      );
      const totalSum = totalArray.reduce((acc, num) => acc + num, 0);
      setTotalBalanceUSD(totalSum.toFixed(2).toString());
    };
    calculateTotalBalance();
    const interval = setInterval(() => {
      refreshBalance();
      calculateTotalBalance();
    }, 50000);
    return () => clearInterval(interval);
  }, [chain, tokens["eth-arbitrumSepolia"].balance]);
  return (
    <div className="h-[25vh] w-full flex items-center justify-center">
      <div className="flex items-center">
        <h1 className="text-6xl font-semibold tracking-wide">
          ${totalBalanceUSD.split(".")[0]}
        </h1>
        <h1 className="text-lg items-start pb-6 text-card font-semibold tracking-wide">
          {"." + totalBalanceUSD.split(".")[1]}
        </h1>
      </div>
    </div>
  );
};

export default GlobalBalance;
