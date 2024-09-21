"use client";
import Image from "next/image";
import { useMe } from "@/providers/MeProvider";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";

import Logo from "@/public/logo.svg";
import Illustration1 from "@/public/illustrations/illustration1.svg";
import Illustration2 from "@/public/illustrations/illustration2.svg";
import LayerZero from "@/public/layerZero.svg";
import LayerZeroB from "@/public/layerZeroBlack.svg";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-12 h-[15vh] bg-white border-b-4 absolute w-full z-10">
      <div className="font-[Gaeil] flex items-center space-x-4">
        <Image src={Logo} alt="logo" width={56} height={56} />
        <div className=" text-[64px]">
          {/* OmniGas */}
          Kuma
        </div>
      </div>
      {/* <Image src={LayerZeroB} alt="logo" width={250} height={250} /> */}
    </header>
  );
};

const Illustrations = () => {
  return (
    <>
      <Image
        src={Illustration1}
        alt="illustration"
        width={750}
        height={750}
        className="absolute -left-16 top-[52%] -translate-y-1/2 z-0"
      />
      <Image
        src={Illustration2}
        alt="illustration"
        width={700}
        height={700}
        className="absolute right-[-10%] top-[48%] -translate-y-1/2 z-20 -rotate-[110deg] pointer-events-none"
      />
    </>
  );
};

const Login = () => {
  const [username, setUsername] = useState("");
  const { create, get, returning, isLoading } = useMe();
  const [createForm, setCreateForm] = useState(!returning);
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div className="flex flex-col items-center justify-center space-y-2 z-10">
        <div className="text-4xl font-bold text-white">
          Access to your Account
        </div>
        {isLoading && <Spinner />}

        {!isLoading && (
          <form
            className="pt-4"
            onSubmit={(e) => {
              if (createForm) {
                e.preventDefault();
                username && create(username);
              }

              if (!createForm) {
                e.preventDefault();
                get();
              }
            }}
          >
            {createForm && (
              <div className="flex ">
                <Input
                  placeholder="Username"
                  className="w-[15vw] text-sm mr-1 rounded-sm"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
                <Button className="rounded-sm">CREATE</Button>
              </div>
            )}
            {!createForm && (
              <Button className="w-[10vw] rounded-none">LOG IN</Button>
            )}
          </form>
        )}
      </div>

      <div className="absolute bottom-0 flex w-full justify-end p-4">
        {!createForm && !isLoading && (
          <div
            onClick={() => {
              !isLoading && setCreateForm(true);
            }}
          >
            or create a new wallet
          </div>
        )}
        {createForm && !isLoading && (
          <div onClick={() => !isLoading && setCreateForm(false)}>
            or log in with an existing passkey
          </div>
        )}
      </div>
      {/* <div className="absolute bottom-0 -z-10 flex w-full items-center justify-center p-4">
        <div className="text-sm">powered by</div>
        <Image
          src={LayerZero}
          alt="layer0"
          width={120}
          height={120}
          className="pl-2"
        />
      </div> */}
    </div>
  );
};

export default function Home() {
  return (
    <>
      <Header />
      <Login />
      <Illustrations />
    </>
  );
}
