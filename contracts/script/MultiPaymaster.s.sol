// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Paymaster} from "../src/Paymaster.sol";

import {BaseDeployer} from "./BaseDeployer.s.sol";

import "account-abstraction/interfaces/IEntryPoint.sol";

/* solhint-disable no-console*/
import {console2} from "forge-std/console2.sol";

contract DeployMultiPaymaster is Script, BaseDeployer {
    address private create2addrCounter;
 
    /// @dev Compute the CREATE2 addresses for contracts (proxy, counter).
    /// @param saltCounter The salt for the counter contract.
    modifier computeCreate2(bytes32 saltCounter) {
        IEntryPoint entryPoint = IEntryPoint(
            0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
        );
        create2addrCounter = computeCreate2Address(
            saltCounter,
            keccak256(
                    abi.encodePacked(
                        type(Paymaster).creationCode,
                        abi.encode(
                            address(entryPoint),
                            address(this),
                            0x6EDCE65403992e310A62460808c4b910D972f10f
                        )
                    )
                )
        );
        _;
    }

    /// @dev Deploy contracts to testnet.
    function deployCounterTestnet(
        uint256 _counterSalt
    ) public setEnvDeploy(Cycle.Test) {
        Chains[] memory deployForks = new Chains[](8);

        counterSalt = bytes32(_counterSalt);

        deployForks[0] = Chains.Sepolia;
        deployForks[1] = Chains.ArbitrumSepolia;
        deployForks[2] = Chains.OptimismSepolia;

        createDeployMultichain(deployForks);
    }

    /// @dev Deploy contracts to selected chains.
    /// @param _counterSalt The salt for the counter contract.
    /// @param deployForks The chains to deploy to.
    /// @param cycle The development cycle to set env variables (dev, test, prod).
    function deployCounterSelectedChains(
        uint256 _counterSalt,
        Chains[] calldata deployForks,
        Cycle cycle
    ) external setEnvDeploy(cycle) {
        counterSalt = bytes32(_counterSalt);

        createDeployMultichain(deployForks);
    }

    /// @dev Helper to iterate over chains and select fork.
    /// @param deployForks The chains to deploy to.
    function createDeployMultichain(
        Chains[] memory deployForks
    ) private computeCreate2(counterSalt) {
        console2.log("P256Verifier create2 address:", create2addrCounter, "\n");

        for (uint256 i; i < deployForks.length; ) {
            console2.log("Deploying P256Verifier to chain: ", uint(deployForks[i]), "\n");

            createSelectFork(deployForks[i]);

            chainDeployCounter();

            unchecked {
                ++i;
            }
        }
    }

    /// @dev Function to perform actual deployment.
    function chainDeployCounter() private broadcast(deployerPrivateKey) {
         IEntryPoint entryPoint = IEntryPoint(
            0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
        );
        
        Paymaster pm = new Paymaster{salt: counterSalt}(entryPoint, address(this), 0x6EDCE65403992e310A62460808c4b910D972f10f);

        require(create2addrCounter == address(pm), "Address mismatch SimplePaymaster ");

        console2.log("SimplePaymaster address:", address(pm), "\n");
    }
}