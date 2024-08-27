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

const Footer = () => {
  const router = useRouter();
  const path = usePathname();
  if (path === "/settings") return null;
  return (
    <footer className="w-full flex items-center justify-around pt-2 pb-8">
      <Button
        variant={path === "/finance" ? "footer" : "ghost"}
        size={"sm"}
        onClick={() => router.push("/finance")}
        className=""
      >
        <HandCoins className="mr-1" />
        {path === "/finance" ? "Finance" : ""}
      </Button>
      <Button
        variant={path === "/" ? "footer" : "ghost"}
        size={"sm"}
        onClick={() => router.push("/")}
      >
        <Home className="mr-1" />
        {path === "/" ? "Home" : ""}
      </Button>
      <Button
        variant={path === "/send" ? "footer" : "ghost"}
        size={"sm"}
        onClick={() => router.push("/send")}
      >
        <CircleChevronRight className="mr-1" />
        {path === "/send" ? "Send" : ""}
      </Button>
    </footer>
  );
};

export default Footer;
