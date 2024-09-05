// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import { IEntryPoint } from "account-abstraction/interfaces/IEntryPoint.sol";
import { UserOperation } from "account-abstraction/interfaces/UserOperation.sol";
import { UserOperationLib } from "account-abstraction/core/UserOperationLib.sol";
import { BasePaymaster } from "account-abstraction/core/BasePaymaster.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { OApp, MessagingFee, Origin } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/OApp.sol";
import { OptionsBuilder } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oapp/libs/OptionsBuilder.sol";

contract Paymaster is BasePaymaster, OApp {
    using UserOperationLib for UserOperation;
    using SafeERC20 for IERC20;
    using OptionsBuilder for bytes;

    uint256 public postOpGas = 50000;

    address public vault;
    
    uint256 public sponsoredGasLimit;

    uint256 public chainId = 40231;

    string public data = "Nothing received yet";

    /// The `_options` variable is typically provided as an argument to both the `_quote` and `_lzSend` functions.
    /// In this example, we demonstrate how to generate the `bytes` value for `_options` and pass it manually.
    /// The `OptionsBuilder` is used to create new options and add an executor option for `LzReceive` with specified parameters.
    /// An off-chain equivalent can be found under 'Message Execution Options' in the LayerZero V2 Documentation.
    bytes _options = OptionsBuilder.newOptions().addExecutorLzReceiveOption(50000, 0);

    constructor(IEntryPoint _entryPoint, address _owner, address _endpoint) BasePaymaster(_entryPoint) OApp(_endpoint, msg.sender) {
        _transferOwnership(_owner);
        vault = _owner;
        sponsoredGasLimit = 100000; // Set a default value, can be changed by owner
    }

    function setChainId(uint256 _chainId) public onlyOwner {
        chainId = _chainId;
    }

    function setPostOpGas(uint256 _postOpGas) public onlyOwner {
        postOpGas = _postOpGas;
    }

    function setVault(address _vault) public onlyOwner {
        vault = _vault;
    }

    function setSponsoredGasLimit(uint256 _limit) public onlyOwner {
        sponsoredGasLimit = _limit;
    }

    event DecodeData(address erc20Token, uint256 exchangeRate, uint256 destEid);
    event Context(bytes context);
    event PostOp(string message,PostOpMode mode, uint256 actualGasCost);
    event ContextDecoded(address sender, IERC20 token, uint256 exchangeRate, uint32 destEid, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas);
    event OpGasMethod(string message);
    event GasCalculation(uint256 opGasPrice, uint256 actualTokenCost);
    event OpMode(string message,PostOpMode mode, PostOpMode mode2,PostOpMode mode3,PostOpMode mode4);
    event Quote(uint32 dstEid, MessagingFee fee);
    event LzSend(uint256 fee,address sender);
    event Message(string message, uint32 dstEid);
    event MessageReceived(address token, address sender, uint256 actualTokenCost);

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

        (address erc20Token, uint256 exchangeRate,uint32 destEid) = abi.decode(userOp.paymasterAndData[20:], (address, uint256,uint32));

        emit DecodeData(erc20Token, exchangeRate, destEid);
        
        context = abi.encode(
            userOp.sender,
            erc20Token,
            exchangeRate,
            destEid,
            userOp.maxFeePerGas,
            userOp.maxPriorityFeePerGas
        );
        validationData = 0;
        emit Context(context);
    }


    function _postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) internal override {
        emit PostOp("PostOp called", mode, actualGasCost);
        (address sender, IERC20 token, uint256 exchangeRate, uint32 destEid, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas) = abi
            .decode(context, (address, IERC20, uint256, uint32, uint256, uint256));

        emit ContextDecoded(sender, token, exchangeRate, destEid, maxFeePerGas, maxPriorityFeePerGas);
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

        uint256 actualTokenCost = ((actualGasCost + (postOpGas * opGasPrice)) * exchangeRate) / 1e18;
        emit GasCalculation(opGasPrice, actualTokenCost);
        emit OpMode("PostOpMode", mode, PostOpMode.opSucceeded, PostOpMode.opReverted, PostOpMode.postOpReverted);
        if (mode != PostOpMode.postOpReverted) {
            emit Message("Op Ok", destEid);
            if(chainId == destEid) {
                token.safeTransferFrom(sender, vault, actualTokenCost);
                emit Message("Transfer Erc20 Same chain successful", destEid);
            }
            else{
                emit Message("Transfer Erc20 other chain submitted", destEid);
                bytes memory _encodedMessage = abi.encode(
                    token,
                    sender,
                    actualTokenCost
                );
                MessagingFee memory fee = quote(destEid, _encodedMessage);
                emit Quote(destEid, fee);
                emit LzSend(address(this).balance, address(this));
                _lzSend(
                    destEid,
                    _encodedMessage,
                    _options,
                    // Fee in native gas and ZRO token.
                    MessagingFee(address(this).balance, 0),
                    // Refund address in case of failed source message.
                    payable(address(this)) 
                );
               emit Message("Transfer Erc20 other chain submitted", destEid);
            }
        }else{
            emit Message("PostOp Reverted", destEid);
        }
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata message,
        address /*executor*/,  // Executor address as specified by the OApp.
        bytes calldata /*_extraData*/  // Any extra data or options to trigger on receipt.
    ) internal override {
        (address token, address sender, uint256 actualTokenCost) = abi.decode(message, (address, address, uint256));
        emit Message("Message received from", _origin.srcEid);
        emit MessageReceived(token, sender, actualTokenCost);
        IERC20(token).safeTransferFrom(sender, vault, actualTokenCost);
    }

    receive() external payable {}

    function addressToBytes32(address _addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function bytes32ToAddress(bytes32 _b) public pure returns (address) {
        return address(uint160(uint256(_b)));
    }

    function quote(
        uint32 _dstEid,
        bytes memory message
    ) public view returns (MessagingFee memory fee) {
        fee = _quote(_dstEid, message, _options, false);
    }
}