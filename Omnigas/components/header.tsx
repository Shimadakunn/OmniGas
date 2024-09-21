"use client";
import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMe } from "@/providers/MeProvider";
import { Button } from "@/components/ui/button";

import { Settings, UserRound } from "lucide-react";
import Logo from "@/public/logo.svg";

import WalletConnect from "./wallet-connect";
import CryptoSelector from "./crypto-selector";
import GasAllowance from "./gas-allowance";

const Header = () => {
  const router = useRouter();
  const path = usePathname();

  const [isCopied, setIsCopied] = useState(false);
  const { me } = useMe();

  if (path === "/settings") return null;

  return (
    <header className="w-full h-[10vh] flex items-center justify-between px-12 bg-white border-b-4 relative">
      <div className="flex items-center justify-center">
        <Button
          onClick={() => {
            navigator.clipboard.writeText(me?.account || "");
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
          }}
          variant="reverse"
        >
          <UserRound className="mr-2" />
          {me?.account.slice(0, 6)}...{me?.account.slice(-4)}
        </Button>
        <Image
          src={Logo}
          alt="logo"
          width={40}
          height={40}
          className="ml-4 mr-1"
        />
        <div className=" text-[50px] font-[Gaeil]">
          {/* OmniGas */}
          Kuma
        </div>
      </div>
      <div className="space-x-4 flex">
        <GasAllowance />
        <CryptoSelector />
        <WalletConnect />
        <Button
          size={"icon"}
          onClick={() => router.push("/settings")}
          className="rounded-full"
        >
          <Settings />
        </Button>
      </div>
    </header>
  );
};

export default Header;
