import {
    GetUserOperationReceiptReturnType,
    getUserOperationReceipt,
} from "@/lib/smart-wallet/service/actions/getUserOperationReceipt";
import { SmartWalletClient } from "@/lib/smart-wallet/service/smart-wallet";
import { observe } from "@/utils/observe";
import { Chain, Hash, stringify } from "viem";

export type WaitForUserOperationReceiptParameters = {
  /** The hash of the transaction. */
  hash: Hash;
  /**
   * Polling frequency (in ms). Defaults to the client's pollingInterval config.
   * @default client.pollingInterval
   */
  pollingInterval?: number;
  /** Optional timeout (in milliseconds) to wait before stopping polling. */
  timeout?: number;
};

export const waitForUserOperationReceipt = <TChain extends Chain | undefined>(
  client: SmartWalletClient,
  {
    hash,
    pollingInterval = client.pollingInterval,
    timeout,
  }: WaitForUserOperationReceiptParameters,
): Promise<GetUserOperationReceiptReturnType> => {
  const observerId = stringify(["waitForUserOperationReceipt", client.uid, hash]);

  let userOperationReceipt: GetUserOperationReceiptReturnType;

  return new Promise((resolve, reject) => {
    if (timeout) {
      setTimeout(
        () => reject(new Error(`WaitForUserOperationReceiptTimeoutError: ${hash}`)),
        timeout,
      );
    }

    const _unobserve = observe(observerId, { resolve, reject }, async (emit) => {
      const _removeInterval = setInterval(async () => {
        const done = (fn: () => void) => {
          clearInterval(_removeInterval);
          fn();
          _unobserve();
        };

        try {
          const _userOperationReceipt = await getUserOperationReceipt(client, { hash });

          if (_userOperationReceipt !== null) {
            userOperationReceipt = _userOperationReceipt;
          }

          if (userOperationReceipt) {
            done(() => emit.resolve(userOperationReceipt));
            return;
          }
        } catch (error) {}
      }, pollingInterval);
    });
  });
};
