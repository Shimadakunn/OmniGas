"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";

function useModalHook() {
  const [content, setContent] = useState<React.ReactNode>(null);
  const [isOpen, setIsOpen] = useState<Boolean>(false);
  const [isBackdrop, setIsBackdrop] = useState<Boolean>(false);

  const closeCb = useRef<any>(null);

  function open(content: React.ReactNode, onCloseCb?: () => Promise<void>) {
    closeCb.current = onCloseCb;

    if (isOpen) {
      setContent(null);
      setIsOpen(false);
      setTimeout(() => {
        setContent(content);
        setIsOpen(true);
      }, 150);
      return;
    }

    setContent(content);
    setIsOpen(true);
    setIsBackdrop(true);
  }

  function close() {
    closeCb.current && closeCb.current();
    closeCb.current = null;
    setContent(null);
    setIsOpen(false);
    setIsBackdrop(false);
  }

  return {
    content,
    isOpen,
    isBackdrop,
    open,
    close,
    setIsOpen,
  };
}

type UseModalHook = ReturnType<typeof useModalHook>;
const ModalContext = React.createContext<UseModalHook | null>(null);

export const useModal = (): UseModalHook => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalHook must be used within a ModalHookProvider");
  }
  return context;
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const modalValue = useModalHook();
  const [isPortalMounted, setIsPortalMounted] = useState(false);

  useEffect(() => {
    setIsPortalMounted(true);
    console.log("portal mounted?", isPortalMounted);
  }, []);

  useEffect(() => {
    console.log("portal mounted?", isPortalMounted);
  }, [isPortalMounted]);

  useEffect(() => {
    console.log("Modal Open", modalValue.isOpen);
  }, [modalValue.isOpen]);

  return (
    <ModalContext.Provider value={modalValue}>
      {children}
      {isPortalMounted && (
        <AlertDialog
          open={modalValue.isOpen ? true : undefined}
          onOpenChange={modalValue.setIsOpen}
        >
          {modalValue.content}
        </AlertDialog>
      )}
    </ModalContext.Provider>
  );
}
