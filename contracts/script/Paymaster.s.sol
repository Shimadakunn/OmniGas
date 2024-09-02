// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "account-abstraction/interfaces/IEntryPoint.sol";
import {Paymaster} from "../src/Paymaster.sol";
import {console2} from "forge-std/console2.sol";

contract DeployPaymaster is Script {
    function run() public {
        vm.startBroadcast();

        // From https://docs.stackup.sh/docs/entity-addresses#entrypoint
        IEntryPoint entryPoint = IEntryPoint(
            0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
        );

        address owner = 0x1f29312f134C79984bA4b21840f2C3DcF57b9c85;

        address peer = 0x6EDCE65403992e310A62460808c4b910D972f10f;

        Paymaster pm = new Paymaster(entryPoint, owner,peer);
        console2.log("Paymaster deployed at", address(pm));
        vm.stopBroadcast();
    }
}
