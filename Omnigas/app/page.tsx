"use client";

import ChainSelector from "@/components/ChainSelector";
import CryptoSelector from "@/components/crypto-selector";
import GlobalBalance from "./home/global-balance";
import TokensDashboard from "./home/tokens-dashboard";

export default function Home() {
  return (
    <main className="h-full w-full flex items-start justify-start flex-col">
      <div className="w-full h-[8vh] flex items-center justify-end px-44"></div>
      <GlobalBalance />
      <TokensDashboard />
    </main>
  );
}
