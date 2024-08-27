"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMe } from "@/providers/MeProvider";
import { Button } from "@/components/ui/button";

import { Settings, UserRound } from "lucide-react";

import WalletConnect from "./wallet-connect";

const Header = () => {
  const router = useRouter();
  const path = usePathname();

  const [isCopied, setIsCopied] = useState(false);
  const { me } = useMe();

  if (path === "/settings") return null;

  return (
    <header className="w-full h-[10vh] flex items-center justify-between p-4 rounded-lg">
      <Button
        onClick={() => {
          navigator.clipboard.writeText(me?.account || "");
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1000);
        }}
      >
        <UserRound className="mr-2" />
        {me?.account.slice(0, 6)}...{me?.account.slice(-4)}
      </Button>
      <div className="text-xl font-bold">
        {path === "/"
          ? "Home"
          : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
      </div>
      <div className="space-x-4">
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
