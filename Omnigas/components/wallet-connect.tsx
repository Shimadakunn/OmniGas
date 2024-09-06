"use client";
import React, { useEffect, useState } from "react";
import ReactQrReader from "react-qr-reader-es6";
import { IWCReactSession, useWalletConnect } from "@/lib/wallet-connect";
import Spinner from "@/components/Spinner";
import { truncate } from "@/utils/truncate";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

import { CircleCheckBig, Scan } from "lucide-react";

const WalletConnect = () => {
  const [isModalActive, setIsModalActive] = useState(false);
  const [input, setInput] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [pairingTopic, setPairingTopic] = useState<string | null>("");
  const [wcReactSession, setWcReactSession] = useState<IWCReactSession | null>(
    null
  );

  const { pairSession, pairingStates, sessions } = useWalletConnect();

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

  let name, icons, url: any;
  if (success && wcReactSession) {
    ({ name, icons, url } = wcReactSession.session.peer.metadata);
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

  useEffect(() => {
    if (!isModalActive) {
      resetState();
    }
  }, [isModalActive]);

  const resetState = () => {
    setInput("");
    setSuccess(false);
    setIsLoading(false);
    setError(null);
    setPairingTopic("");
    setWcReactSession(null);
  };

  return (
    <>
      <Button
        onClick={() => {
          setIsModalActive(true);
        }}
        size={"icon"}
        className="rounded-full"
      >
        <Scan className="" />
      </Button>
      <Modal
        active={isModalActive}
        setActive={setIsModalActive}
        className="min-w-[300px] w-[30vw] space-y-2 bg-mainAccent rounded-xl"
      >
        {success && wcReactSession && (
          <>
            {icons && (
              <img
                src={icons[0]}
                alt="test"
                width={100}
                style={{ borderRadius: "10px" }}
              />
            )}
            <h1 className="text-2xl font-bold text-center text-white">
              {name}
            </h1>
            <Button
              variant={"link"}
              onClick={() => {
                window.open(url, "_blank");
              }}
              className="text-white"
            >
              {truncate(url?.split("https://")[1] ?? "Unknown", 23)}
            </Button>
            <CircleCheckBig color="#DBCAF4" />
          </>
        )}
        {isLoading && <Spinner />}
        {!isLoading && !success && !error && !wcReactSession && (
          <>
            <p className="text-2xl pb-2 text-white">Connect to a Dapp</p>
            <div className="flex w-full space-x-4 items-center justify-center my-auto">
              <Input
                className="w-[15vw] rounded-none"
                placeholder="wc:…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              ></Input>
              <Button
                variant="reverse"
                onClick={() => {
                  setError(null);
                  handlePair(input);
                }}
                className="bg-rose"
              >
                {isLoading ? "is connecting" : "Connect"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default WalletConnect;
