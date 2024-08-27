// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console2.sol";
import "../src/Paymaster.sol"; // Adjust this path as needed
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "account-abstraction/interfaces/IEntryPoint.sol";
import "account-abstraction/core/EntryPoint.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

contract PaymasterTest is Test {
    Paymaster public paymaster;
    MockERC20 public token;
    EntryPoint public entryPoint;
    address public owner;
    address public sender;

    function setUp() public {
        owner = address(this);
        sender = address(0x1234);
        entryPoint = new EntryPoint();
        paymaster = new Paymaster(IEntryPoint(address(entryPoint)), owner);
        token = new MockERC20();

        // Fund the paymaster with some ETH
        payable(address(paymaster)).transfer(1 ether);

        // Fund the sender with some tokens
        token.transfer(sender, 1000 * 10**18);

        vm.prank(sender);
        token.approve(address(paymaster), type(uint256).max);
    }

    function testValidatePaymasterUserOp() public {
        bytes memory dummySignature = new bytes(65);

        UserOperation memory userOp = UserOperation({
            sender: sender,
            nonce: 0,
            initCode: bytes(""),
            callData: bytes(""),
            callGasLimit: 1000000,
            verificationGasLimit: 1000000,
            preVerificationGas: 1000000,
            maxFeePerGas: 1 gwei,
            maxPriorityFeePerGas: 1 gwei,
            paymasterAndData: abi.encodePacked(
                address(paymaster),
                abi.encode(address(token), 1000 * 10**18),
                dummySignature
            ),
            signature: bytes("")
        });

        console2.log("Paymaster ETH balance:", address(paymaster).balance);
        console2.log("Sender token balance:", token.balanceOf(sender));
        console2.log("Paymaster token allowance:", token.allowance(sender, address(paymaster)));

        bytes32 userOpHash = keccak256(abi.encode(userOp));
        uint256 requiredPrefund = 1 ether;

        try paymaster.validatePaymasterUserOp(userOp, userOpHash, requiredPrefund) returns (bytes memory context, uint256 validationData) {
            console2.log("Validation successful");
            console2.logBytes(context);
            console2.log("Validation data:", validationData);
        } catch Error(string memory reason) {
            console2.log("Validation failed with reason:", reason);
        } catch (bytes memory lowLevelData) {
            console2.log("Validation failed with low-level error");
            console2.logBytes(lowLevelData);
        }
    }
}