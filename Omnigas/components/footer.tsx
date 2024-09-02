"use client";
import { usePathname, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Home,
  CircleChevronRight,
  Scan,
  ArrowRightLeft,
  HandCoins,
} from "lucide-react";

import Logo from "@/public/logo.svg";
import Image from "next/image";

const Footer = () => {
  const router = useRouter();
  const path = usePathname();
  if (path === "/settings") return null;
  return (
    <footer className="w-full flex items-center justify-between h-[8vh] px-8 ">
      <Button
        variant={path === "/finance" ? "footer" : "ghost"}
        size={"sm"}
        onClick={() => router.push("/finance")}
      >
        <HandCoins className="mr-1" />
        {path === "/finance" ? "Finance" : ""}
      </Button>
      <div className=""></div>
      <Image src={Logo} alt="logo" width={45} height={45} />
    </footer>
  );
};

export default Footer;
