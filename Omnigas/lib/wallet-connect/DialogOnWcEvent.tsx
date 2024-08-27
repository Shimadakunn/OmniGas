"use client";

import React, { useEffect } from "react";
import { useModal } from "@/providers/WcEventsProvider";
import {
  EthSendEventPayload,
  WCEvent,
  walletConnect,
} from "./service/wallet-connect";
// import WCNotSupportedModal from "@/components/WCNotSupportedModal";
import WCSendTransactionModal from "@/components/WcDialog/WcDialog";

export function ModalOnWCEvent({ children }: { children: React.ReactNode }) {
  const { open } = useModal();

  useEffect(() => {
    function handleEthSendTransaction({
      params,
      origin,
      onSuccess,
      onReject,
    }: EthSendEventPayload) {
      console.log("open send transaction modal");
      open(
        <WCSendTransactionModal
          params={params}
          origin={origin}
          onSuccess={onSuccess}
          onReject={onReject}
        />,
        onReject
      );
    }

    function handleMethodNotSupported(method: string) {
      console.log("open not surported");
      // open(<WCNotSupportedModal method={method} />);
    }

    // walletConnect.on(WCEvent.MethodNotSupported, handleMethodNotSupported);
    walletConnect.on(WCEvent.EthSendTransaction, handleEthSendTransaction);
    return () => {
      // walletConnect.removeListener(WCEvent.MethodNotSupported, handleMethodNotSupported);
      walletConnect.removeListener(
        WCEvent.EthSendTransaction,
        handleEthSendTransaction
      );
    };
  }, [open]);

  return <>{children}</>;
}
