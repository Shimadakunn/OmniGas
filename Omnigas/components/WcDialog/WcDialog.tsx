"use client";

import { useEffect, useState } from "react";
import Spinner from "../Spinner";
import { UserOpBuilder } from "@/lib/smart-wallet/service/userOps";
import { smartWallet } from "@/lib/smart-wallet";
import { Chain, Hash, formatEther } from "viem";
import { useMe } from "@/providers/MeProvider";
import { useBalance } from "@/providers/BalanceProvider";
import { EthSendTransactionParams } from "@/lib/wallet-connect/config/EIP155";
import { chains } from "@/constants";
import { CircleCheckBig, CircleX, CircleChevronDown } from "lucide-react";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
// import { on } from "cbor/types/vendor/binary-parse-stream";

type Props = {
  params: EthSendTransactionParams;
  origin: string;
  onSuccess: (hash: Hash) => void;
  onReject: () => void;
};

export default function WCSendTransactionModal({
  params,
  origin,
  onSuccess,
  onReject,
}: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txReceipt, setTxReceipt] = useState<any>(null);
  const [destination, setDestination] = useState<string>("");
  const [txSubmitted, setTxSubmitted] = useState<boolean>(false);
  const [ensIsLoading, setEnsIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { me } = useMe();
  const { refreshBalance } = useBalance();

  useEffect(() => {
    if (!params?.to) return;

    async function resolveUserInputDestination(value: string) {
      if (!value) {
        setDestination("");
        return;
      }

      if (value.match(/^0x[a-fA-F0-9]{40}$/)) {
        const minifiedAddress = value.slice(0, 6) + "..." + value.slice(-4);
        setDestination(minifiedAddress);
        return;
      }
    }

    resolveUserInputDestination(params?.to);
  }, [params?.to]);

  useEffect(() => {
    if (txReceipt) {
      const timer = setTimeout(async () => {
        setTxReceipt(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [txReceipt]);

  const submitTx = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!me?.keyId) throw new Error("No user found");
      const builder = new UserOpBuilder();
      const chain = Object.values(chains).find(
        (c) => c.viem === smartWallet.client.chain
      );
      builder.init(chain!);
      smartWallet.init(chain!);
      const { maxFeePerGas, maxPriorityFeePerGas } =
        await smartWallet.client.estimateFeesPerGas();

      const value = params?.value ? BigInt(params.value) : BigInt(0);

      const userOp = await builder.buildUserOp({
        calls: [
          {
            dest: params.to,
            value,
            data: params.data,
          },
        ],
        maxFeePerGas: maxFeePerGas as bigint,
        maxPriorityFeePerGas: maxPriorityFeePerGas as bigint,
        keyId: me.keyId,
      });

      const hash = await smartWallet.sendUserOperation({ userOp });
      const receipt = await smartWallet.waitForUserOperationReceipt({ hash });
      setTxReceipt(receipt);
      onSuccess(receipt?.receipt?.transactionHash);
    } catch (e: any) {
      console.log("error occured");
      console.error(e);
      setError(e);
    } finally {
      setIsLoading(false);
      refreshBalance();
      onReject();
      setTxSubmitted(true);
    }
  };

  if (isLoading)
    return (
      <AlertDialogContent className="w-[95vw] py-4">
        <Spinner />
        <AlertDialogCancel>Cancel</AlertDialogCancel>
      </AlertDialogContent>
    );

  if (txReceipt && !isLoading)
    return (
      <>
        <AlertDialogContent className="w-[95vw] py-4">
          {true ? (
            <>
              <Button
                variant={"link"}
                onClick={() =>
                  window.open(
                    `${
                      chains["arbitrumSepolia"].viem.blockExplorers!.default.url
                    }/tx/${txReceipt?.receipt?.transactionHash}`,
                    "blank"
                  )
                }
              >
                <CircleCheckBig className="text-secondary mr-1" />
                Transaction Successful!
              </Button>
            </>
          ) : (
            <>Not Receipt</>
          )}
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogContent>
      </>
    );

  return (
    !txReceipt &&
    !txSubmitted &&
    !isLoading && (
      <AlertDialogContent className="w-[95vw] py-4">
        <>
          <AlertDialogHeader>
            <AlertDialogTitle>{origin}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 text-muted-foreground">To</div>
              <div className="col-span-3 text-right">{destination}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 text-muted-foreground">Amount</div>
              <div className="col-span-3 text-right">
                {formatEther(BigInt(params?.value || 0)).toString()}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1 text-muted-foreground">Data</div>
              <div className="col-span-3 text-right truncate">
                {params.data}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onReject()}>
              Cancel
            </AlertDialogCancel>
            <Button onClick={() => submitTx()}>Send Tx</Button>
          </AlertDialogFooter>
        </>
      </AlertDialogContent>
    )
  );
}
