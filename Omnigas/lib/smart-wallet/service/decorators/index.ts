import { SmartWalletClient } from "@/lib/smart-wallet/service/smart-wallet";
import { UserOperationAsHex } from "@/lib/smart-wallet/service/userOps";
import { Client, publicActions } from "viem";
import {
  EstimateUserOperationGasReturnType,
  GetIsValidSignatureReturnType,
  GetUserOperationReceiptReturnType,
  SendUserOperationReturnType,
  estimateUserOperationGas,
  getIsValidSignature,
  getUserOperationReceipt,
  sendUserOperation,
  waitForUserOperationReceipt,
} from "../actions";

export type SmartWalletActions = {
  sendUserOperation: (args: {
    userOp: UserOperationAsHex;
  }) => Promise<SendUserOperationReturnType>;
  estimateUserOperationGas: (args: {
    userOp: UserOperationAsHex;
  }) => Promise<EstimateUserOperationGasReturnType>;
  getUserOperationReceipt: (
    args: any
  ) => Promise<GetUserOperationReceiptReturnType>;
  getIsValidSignature: (args: any) => Promise<GetIsValidSignatureReturnType>;
  waitForUserOperationReceipt: (
    args: any
  ) => Promise<GetUserOperationReceiptReturnType>;
};

export function smartWalletActions(client: Client): SmartWalletActions {
  return {
    ...publicActions(client),
    sendUserOperation: (args) =>
      sendUserOperation(client as SmartWalletClient, args),
    estimateUserOperationGas: (args) =>
      estimateUserOperationGas(client as SmartWalletClient, args),
    getUserOperationReceipt: (args) =>
      getUserOperationReceipt(client as SmartWalletClient, args),
    getIsValidSignature: (args) =>
      getIsValidSignature(client as SmartWalletClient, args),
    waitForUserOperationReceipt: (args) =>
      waitForUserOperationReceipt(client as SmartWalletClient, args),
  };
}
