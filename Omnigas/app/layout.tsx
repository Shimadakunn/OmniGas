import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

import { WalletConnectProvider } from "@/lib/wallet-connect";
import { SmartWalletProvider } from "@/lib/smart-wallet/SmartWalletProvider";

import { BalanceProvider } from "@/providers/BalanceProvider";
import { MeProvider } from "@/providers/MeProvider";
import { ModalProvider } from "@/providers/WcEventsProvider";
import { ModalOnWCEvent } from "@/lib/wallet-connect/DialogOnWcEvent";

import { Toaster } from "@/components/ui/toaster";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omnichain Gas",
  description: "Omnichain Gas Transfer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lexend.className}>
        <MeProvider>
          <WalletConnectProvider>
            <BalanceProvider>
              <SmartWalletProvider>
                <ModalProvider>
                  <ModalOnWCEvent>{children}</ModalOnWCEvent>
                </ModalProvider>
                <Toaster />
              </SmartWalletProvider>
            </BalanceProvider>
          </WalletConnectProvider>
        </MeProvider>
      </body>
    </html>
  );
}
