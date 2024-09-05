"use client";

import ChainSelector from "@/components/ChainSelector";
import SendTx from "./send";

const Send = () => {
  return (
    <div className="h-full w-full flex items-start justify-center flex-col">
      <SendTx />
    </div>
  );
};

export default Send;
