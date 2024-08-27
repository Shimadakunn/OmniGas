import { SmartWalletClient } from "@/lib/smart-wallet/service/smart-wallet";
import { Hash } from "viem";
import axios from "axios";

export type GetUserOperationReceiptReturnType = Hash;

export async function getUserOperationReceipt(
  client: SmartWalletClient,
  args: { hash: Hash }
): Promise<any> {
  try {
    const response = await axios.post(client.transport.url, {
      jsonrpc: "2.0",
      method: "eth_getUserOperationReceipt",
      params: [args.hash],
      id: 1,
    });
    console.log("waiting receipt", response);

    return response.data.result;
  } catch (error) {
    console.error("Error fetching getUserOperationReceipt:", error);
    throw error;
  }
  return await client.request({
    method: "eth_getUserOperationReceipt" as any,
    params: [args.hash],
  });
}
