// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "account-abstraction/interfaces/IPaymaster.sol";

import { IEntryPoint } from "account-abstraction/interfaces/IEntryPoint.sol";
import { UserOperation } from "account-abstraction/interfaces/UserOperation.sol";
import { UserOperationLib } from "account-abstraction/core/UserOperationLib.sol";
import { BasePaymaster } from "account-abstraction/core/BasePaymaster.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

contract SimplePaymaster is IPaymaster {
    function validatePaymasterUserOp(UserOperation calldata, bytes32, uint256)
        external 
        pure
        returns (bytes memory context, uint256 validationData)
    {
        //Paymaster server
        // first 20 bites of the paymasterAndData is the paymaster address
        //data: timePeriod of the paymaster valid
        //signature of paymaster
        context = new bytes(0);
        validationData = 0;
    }

    /**
     * post-operation handler.
     * Must verify sender is the entryPoint
     * @param mode enum with the following options:
     *      opSucceeded - user operation succeeded.
     *      opReverted  - user op reverted. still has to pay for gas.
     *      postOpReverted - user op succeeded, but caused postOp (in mode=opSucceeded) to revert.
     *                       Now this is the 2nd call, after user's op was deliberately reverted.
     * @param context - the context value returned by validatePaymasterUserOp
     * @param actualGasCost - actual gas used so far (without this postOp call).
     */
    function postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) external{
        
    }
}