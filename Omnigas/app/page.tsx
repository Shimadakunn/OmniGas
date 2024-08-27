"use client";

import ChainSelector from "@/components/ChainSelector";
import GlobalBalance from "./home/global-balance";
import TokensDashboard from "./home/tokens-dashboard";

export default function Home() {
  return (
    <main className="h-full w-full flex items-start justify-start flex-col">
      <ChainSelector />
      <GlobalBalance />
      <TokensDashboard />
    </main>
  );
}
