import { ENTRYPOINT_ADDRESS } from "@/constants";
import { SmartWalletClient } from "@/lib/smart-wallet/service/smart-wallet";
import { UserOperationAsHex } from "@/lib/smart-wallet/service/userOps";
import { Hash } from "viem";
import axios from "axios";
/*  */
export type SendUserOperationReturnType = Hash;

export async function sendUserOperation(
  client: SmartWalletClient,
  args: { userOp: UserOperationAsHex }
): Promise<SendUserOperationReturnType> {
  try {
    const response = await axios.post(client.transport.url, {
      jsonrpc: "2.0",
      method: "eth_sendUserOperation",
      params: [args.userOp, ENTRYPOINT_ADDRESS],
      id: 1,
    });
    console.log("UserOp Hash", response);

    return response.data.result;
  } catch (error) {
    console.error("Error fetching sendUserOperation:", error);
    throw error;
  }
  return await client.request({
    method: "eth_sendUserOperation" as any,
    params: [args.userOp, ENTRYPOINT_ADDRESS],
  });
}
