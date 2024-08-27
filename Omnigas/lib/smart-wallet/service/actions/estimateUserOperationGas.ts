import { ENTRYPOINT_ADDRESS } from "@/constants";
import { SmartWalletClient } from "@/lib/smart-wallet/service/smart-wallet";
import { UserOperationAsHex } from "@/lib/smart-wallet/service/userOps";
import axios from "axios";

/*  */
export type EstimateUserOperationGasReturnType = {
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
};

export async function estimateUserOperationGas(
  client: SmartWalletClient,
  args: { userOp: UserOperationAsHex }
): Promise<EstimateUserOperationGasReturnType> {
  try {
    const response = await axios.post(client.transport.url, {
      jsonrpc: "2.0",
      method: "eth_estimateUserOperationGas",
      params: [{ ...args.userOp }, ENTRYPOINT_ADDRESS],
      id: 1,
    });
    console.log("estimated UserOp Gas", response);

    return response.data.result;
  } catch (error) {
    console.error("Error fetching estimateUserOperationGas", error);
    throw error;
  }
  return await client.request({
    method: "eth_estimateUserOperationGas" as any,
    params: [{ ...args.userOp }, ENTRYPOINT_ADDRESS],
  });
}
