import { useEffect, useState } from "react";
import { smartWallet } from "../service/smart-wallet";
import { Hash } from "viem";
import{chains} from "@/constants";

export function useSmartWalletHook() {
  const [address, setAddress] = useState<Hash | null>(null);

  async function init(address: Hash) {
    smartWallet.init(chains["eth-arbitrumSepolia"]);
    setAddress(address);
  }

  useEffect(() => {
    if (!address) return;

    smartWallet.client.watchEvent({
      address: address,
      onLogs: (logs: any) => {},
    });
  }, [address]);

  return {
    address,
    init,
  };
}
