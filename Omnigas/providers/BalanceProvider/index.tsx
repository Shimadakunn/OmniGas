"use client";

import { getBalances } from "@/providers/BalanceProvider/getBalances";
import { useMe } from "@/providers/MeProvider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Hex, formatEther } from "viem";

import Login from "@/components/login";
import Header from "@/components/header";
import Footer from "@/components/footer";

function useBalanceHook() {
  const [balances, setBalances] = useState<string[]>([]);
  const [increment, setIncrement] = useState<number>(0);

  const { me } = useMe();

  const fetchBalances = useCallback(async (address: Hex) => {
    const result = await getBalances(address);
    console.log("getBalances", result.balances);
    setBalances(result.balances);
  }, []);

  const refreshBalance = useCallback(() => {
    setIncrement((prev) => prev + 1);
  }, []);

  let interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!me?.account) return;
    fetchBalances(me?.account);
    interval.current && clearInterval(interval.current);
    interval.current = setInterval(() => {
      fetchBalances(me?.account);
    }, 50000);

    return () => {
      interval.current && clearInterval(interval.current);
    };
  }, [me?.account, increment, fetchBalances]);

  return {
    balances,
    fetchBalances,
    refreshBalance,
  };
}

type UseBalanceHook = ReturnType<typeof useBalanceHook>;
const BalanceContext = createContext<UseBalanceHook | null>(null);

export const useBalance = (): UseBalanceHook => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalanceHook must be used within a BalanceProvider");
  }
  return context;
};

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const hook = useBalanceHook();
  const { me, isMounted } = useMe();
  useEffect(() => {
    console.log("me", me);
  }, []);
  return (
    <BalanceContext.Provider value={hook}>
      {!isMounted ? null : me ? (
        // <Login />
        <div
          className="h-full flex items-center justify-between flex-col"
          id="modal"
        >
          <Header />
          {children}
          <Footer />
        </div>
      ) : (
        <Login />
      )}
    </BalanceContext.Provider>
  );
}
