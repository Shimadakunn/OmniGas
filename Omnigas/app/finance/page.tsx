"use client";

import ChainSelector from "@/components/ChainSelector";
import SuppliedBalance from "./supplied-balance";
import Interact from "./interact";

export default function Finance() {
  return (
    <main className="h-full w-full flex items-start justify-start flex-col">
      <ChainSelector />
      <SuppliedBalance />
      <Interact />
    </main>
  );
}
