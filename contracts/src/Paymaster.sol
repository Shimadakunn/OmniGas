// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import { IEntryPoint } from "account-abstraction/interfaces/IEntryPoint.sol";
import { UserOperation } from "account-abstraction/interfaces/UserOperation.sol";
import { UserOperationLib } from "account-abstraction/core/UserOperationLib.sol";
import { BasePaymaster } from "account-abstraction/core/BasePaymaster.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

contract Paymaster is BasePaymaster {
    using UserOperationLib for UserOperation;
    using SafeERC20 for IERC20;

    uint256 public constant POST_OP_GAS = 35000;

    address public vault;
    
    uint256 public sponsoredGasLimit;

    constructor(IEntryPoint _entryPoint, address _owner) BasePaymaster(_entryPoint) {
        _transferOwnership(_owner);
        vault = _owner;
        sponsoredGasLimit = 100000; // Set a default value, can be changed by owner
    }

    function setVault(address _vault) public onlyOwner {
        vault = _vault;
    }

    function setSponsoredGasLimit(uint256 _limit) public onlyOwner {
        sponsoredGasLimit = _limit;
    }

    event DecodeData(address erc20Token, uint256 exchangeRate);
    event Context(bytes context);
    event PostOp(string message,PostOpMode mode, uint256 actualGasCost);
    event ContextDecoded(address sender, IERC20 token, uint256 exchangeRate, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas);
    event OpGasMethod(string message);
    event GasCalculation(uint256 opGasPrice, uint256 actualTokenCost);
    event Transfer(string message);

    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 /*userOpHash*/,
        uint256 requiredPreFund
    ) internal override returns (bytes memory context, uint256 validationData) {
        (requiredPreFund);

        if(userOp.paymasterAndData.length == 20) {
            emit Context(new bytes(0));
            return (new bytes(0), 0);
        }

        (address erc20Token, uint256 exchangeRate) = abi.decode(userOp.paymasterAndData[20:], (address, uint256));

        emit DecodeData(erc20Token, exchangeRate);
        
        context = abi.encode(
            userOp.sender,
            erc20Token,
            exchangeRate,
            userOp.maxFeePerGas,
            userOp.maxPriorityFeePerGas
        );
        validationData = 0;
        emit Context(context);
    }


    function _postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) internal override {
        emit PostOp("PostOp called", mode, actualGasCost);
        (address sender, IERC20 token, uint256 exchangeRate, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas) = abi
            .decode(context, (address, IERC20, uint256, uint256, uint256));

        emit ContextDecoded(sender, token, exchangeRate, maxFeePerGas, maxPriorityFeePerGas);
        uint256 opGasPrice;
        unchecked {
            if (maxFeePerGas == maxPriorityFeePerGas) {
                emit OpGasMethod("maxFeePerGas == maxPriorityFeePerGas");
                opGasPrice = maxFeePerGas;
            } else {
                emit OpGasMethod("maxFeePerGas != maxPriorityFeePerGas");
                opGasPrice = Math.min(maxFeePerGas, maxPriorityFeePerGas + block.basefee);
            }
        }

        uint256 actualTokenCost = ((actualGasCost + (POST_OP_GAS * opGasPrice)) * exchangeRate) / 1e18;
        emit GasCalculation(opGasPrice, actualTokenCost);

        if (mode != PostOpMode.postOpReverted) {
            token.safeTransferFrom(sender, vault, actualTokenCost);
            emit Transfer("Transfer successful");
        }
    }

    receive() external payable {}
}