"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";
import { formatBalance } from "@/utils/formatBalance";
import { tokens, chains } from "@/constants";
import { ApproveErc20 } from "@/lib/functions/approve";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import Modal from "@/components/ui/modal";

import { CirclePlus, CircleX, CircleCheckBig } from "lucide-react";
import Spinner from "@/components/Spinner";

export const GasAllowance = () => {
  const [isModalActive, setIsModalActive] = useState(false);
  const { me } = useMe();
  const { refreshBalance } = useBalance();

  const [feeToken, setFeeToken] = useState<string>("usdc-arbitrumSepolia");
  const [input, setInput] = useState<string>("");

  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (txReceipt) {
      const timer = setTimeout(() => {
        setTxReceipt(null);
        setError(null);
        setInput("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [txReceipt, setIsModalActive]);

  return (
    <>
      <Button
        onClick={() => {
          setIsModalActive(true);
        }}
        size={"icon"}
        className="rounded-full"
      >
        <CirclePlus className="" />
      </Button>
      <Modal
        active={isModalActive}
        setActive={setIsModalActive}
        className="min-w-[400px] min-h-[170px] w-[30vw] h-[20vh] space-y-2 bg-mainAccent rounded-xl"
      >
        {error && !isLoading && (
          <div className="flex items-center">
            <CircleX className="text-destructive mr-1" />
            An error occurred! Please try again.
          </div>
        )}
        {isLoading && (
          <div className="flex items-center space-x-1">
            <Spinner />
            Sending Transaction...
          </div>
        )}
        {txReceipt && !isLoading && !error && (
          <>
            {true ? (
              <Button
                variant={"link"}
                onClick={() =>
                  window.open(
                    `${
                      chains[tokens[feeToken].network].viem.blockExplorers!
                        .default.url
                    }/tx/${txReceipt?.receipt?.transactionHash}`,
                    "blank"
                  )
                }
              >
                <CircleCheckBig className="text-secondary mr-1" />
                Transaction Successful!
              </Button>
            ) : (
              <Button
                variant={"link"}
                onClick={() =>
                  window.open(
                    `${
                      chains[tokens[feeToken].network].viem.blockExplorers!
                        .default.url
                    }/tx/${txReceipt?.receipt?.transactionHash}`,
                    "blank"
                  )
                }
              >
                <CircleX className="text-destructive mr-1" />
                Transaction Failed!
              </Button>
            )}
          </>
        )}
        {!isLoading && !txReceipt && !error && (
          <>
            <p className="text-2xl pb-2 text-white">Add gas Allowance</p>
            <div className="flex w-full space-x-4 items-center justify-center my-auto">
              <Input
                className="w-[15vw] rounded-none"
                placeholder="10"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              ></Input>
              <Select
                onValueChange={(e: any) => setFeeToken(e)}
                defaultValue={feeToken}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.keys(tokens).map((token) => (
                      //   "USDC" === tokens[token].coin && (
                      <SelectItem value={token} key={token}>
                        <div className="flex flex-row items-center space-x-1">
                          <div className="relative">
                            <Image
                              src={`/tokens-icons/${tokens[
                                token
                              ].coin.toLowerCase()}.svg`}
                              width={25}
                              height={25}
                              alt={tokens[token].coin}
                            />
                            <Image
                              src={`/chains-icons/${
                                chains[tokens[token].network].viem.name
                              }.svg`}
                              width={15}
                              height={15}
                              alt={tokens[token].coin}
                              className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4"
                            />
                          </div>
                          <h1>{tokens[token].coin}</h1>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="">
              <Button
                variant="reverse"
                onClick={async () =>
                  setTxReceipt(
                    await ApproveErc20(
                      tokens[feeToken],
                      me!,
                      input,
                      setIsLoading,
                      refreshBalance,
                      setError
                    )
                  )
                }
                className="bg-rose"
              >
                {isLoading ? "is adding" : "Add"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};
export default GasAllowance;
