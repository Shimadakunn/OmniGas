"use client";
import { usePathname, useRouter } from "next/navigation";
import LayerZero from "@/public/layerZero.svg";

import Logo from "@/public/logo.svg";
import Image from "next/image";

const Footer = () => {
  const router = useRouter();
  const path = usePathname();
  if (path === "/settings") return null;
  return (
    <footer className="w-full flex items-center justify-between h-[8vh] px-8 ">
      {/* <Button
        variant={path === "/finance" ? "footer" : "ghost"}
        size={"sm"}
        onClick={() => router.push("/finance")}
      >
        <HandCoins className="mr-1" />
        {path === "/finance" ? "Finance" : ""}
      </Button> */}
      {/* <Image
        src={LayerZero}
        alt="layer0"
        width={120}
        height={120}
        className="pl-2"
      /> */}
      <div className=""></div>
      <Image
        src={Logo}
        alt="logo"
        width={45}
        height={45}
        onClick={() => router.push("/")}
      />
    </footer>
  );
};

export default Footer;
