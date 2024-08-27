"use client";
import React, { useEffect, useState } from "react";
import ReactQrReader from "react-qr-reader-es6";
import { IWCReactSession, useWalletConnect } from "@/lib/wallet-connect";
import Spinner from "@/components/Spinner";
import { truncate } from "@/utils/truncate";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CircleCheckBig, Scan } from "lucide-react";

const WalletConnect = () => {
  const [input, setInput] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pairingTopic, setPairingTopic] = useState<string | null>("");
  const [wcReactSession, setWcReactSession] = useState<IWCReactSession | null>(
    null
  );
  const { pairSession, pairingStates, sessions } = useWalletConnect();
  const [isOpen, setIsOpen] = useState(false);

  function handlePair(data: string | null) {
    if (data?.startsWith("wc:")) {
      setIsLoading(true);
      pairSession({
        uri: data,
        onStart: (pairingTopic) => {
          setPairingTopic(pairingTopic);
        },
        onSuccess: (pairingTopic) => {},
        onError: (error) => {
          setPairingTopic(null);
          setIsLoading(false);
          setSuccess(false);
          setError(error);
        },
      });
    } else {
      if (!data) {
        setError({
          message: "Please add a valid Wallet Connect code ",
        } as Error);
      }
      setError({ message: "Invalid Wallet Connect QR code" } as Error);
    }
  }

  function handleScan(data: string | null) {
    if (data) {
      handlePair(data);
      if (data.startsWith("0x")) {
        console.log("TODO: handle ethereum address");
      }
    }
  }

  useEffect(() => {
    if (!pairingTopic) return;
    const pairingState = pairingStates[pairingTopic];

    setIsLoading(pairingState?.isLoading || false);

    const session = Object.values(sessions)?.find(
      (el: IWCReactSession) => el?.session?.pairingTopic === pairingTopic
    );
    if (session) {
      setWcReactSession(session);
      setSuccess(true);
    }
  }, [sessions, pairingTopic, pairingStates]);

  const resetState = () => {
    setInput("");
    setSuccess(false);
    setIsLoading(false);
    setError(null);
    setPairingTopic("");
    setWcReactSession(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  let name, icons, url: any;
  if (success && wcReactSession) {
    ({ name, icons, url } = wcReactSession.session.peer.metadata);
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger>
        <Button size={"icon"} className="rounded-full">
          <Scan className="" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="py-5 px-4 max-w-[600px]">
        {success && wcReactSession && (
          <div className="w-full flex items-center justify-center space-y-4 flex-col h-[60vh]">
            {icons && (
              <img
                src={icons[0]}
                alt="test"
                width={100}
                style={{ borderRadius: "10px" }}
              />
            )}
            <h1 className="text-2xl font-bold text-center">{name}</h1>
            <Button
              variant={"link"}
              size={"link"}
              onClick={() => {
                window.open(url, "_blank");
              }}
            >
              {truncate(url?.split("https://")[1] ?? "Unknown", 23)}
            </Button>
            <CircleCheckBig />
          </div>
        )}
        {isLoading && (
          <div className="w-full flex items-center justify-center h-[60vh]">
            <Spinner />
          </div>
        )}
        {!isLoading && !success && !error && !wcReactSession && (
          <div className="flex items-center justify-center space-y-4 flex-col mt-4 h-[60vh]">
            <ReactQrReader
              style={{
                borderRadius: " 10px",
                width: "100%",
                overflow: "hidden",
                background: "var(--gray-5)",
              }}
              showViewFinder={false}
              onError={(err) => console.error(err)}
              onScan={handleScan}
            />

            <div className="w-full flex items-center justify-center flex-row">
              <Input
                placeholder="wc:…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="text-sm mr-2"
              />
              <Button
                onClick={() => {
                  setError(null);
                  handlePair(input);
                }}
              >
                {isLoading ? "is connecting" : "Connect"}
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default WalletConnect;
