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
      <div className="font-[Gaeil] items-center space-x-4 hidden">
        <Image src={Logo} alt="logo" width={45} height={45} />
        <div className=" text-[56px]">OmniGas</div>
      </div>
      <div className="font-[Gaeil] flex items-center space-x-4 absolute right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2">
        <Image src={Logo} alt="logo" width={45} height={45} />
        <div className=" text-[56px]">OmniGas</div>
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
