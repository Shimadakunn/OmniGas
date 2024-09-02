// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";

/* solhint-disable max-states-count */
contract BaseDeployer is Script {
    bytes32 internal counterSalt;

    uint256 internal deployerPrivateKey;

    address internal entryPointAddress;
    address internal proxyCounterAddress;

    enum Chains {
        Sepolia,
        ArbitrumSepolia,
        OptimismSepolia,
        Etherum,
        Arbitrum,
        Optimism
    }

    enum Cycle {
        Test,
        Prod
    }

    /// @dev Mapping of chain enum to rpc url
    mapping(Chains chains => string rpcUrls) public forks;

    /// @dev environment variable setup for deployment
    /// @param cycle deployment cycle (dev, test, prod)
    modifier setEnvDeploy(Cycle cycle) {
        if (cycle == Cycle.Test) {
            deployerPrivateKey = vm.envUint("PRIVATE_KEY");
            entryPointAddress = vm.envAddress("ENTRYPOINT");
        } else {
            deployerPrivateKey = vm.envUint("PRIVATE_KEY");
            entryPointAddress = vm.envAddress("ENTRYPOINT");
        }

        _;
    }

    /// @dev broadcast transaction modifier
    /// @param pk private key to broadcast transaction
    modifier broadcast(uint256 pk) {
        vm.startBroadcast(pk);

        _;

        vm.stopBroadcast();
    }

    constructor() {
        // Testnet
        forks[Chains.Sepolia] = vm.envString("SEPOLIA_RPC_URL");
        forks[Chains.ArbitrumSepolia] = vm.envString("ARBITRUM_SEPOLIA_RPC_URL");
        forks[Chains.OptimismSepolia] = vm.envString("OPTIMISM_SEPOLIA_RPC_URL");

        // Mainnet
        forks[Chains.Etherum] = "etherum";
        forks[Chains.Arbitrum] = "arbitrum";
        forks[Chains.Optimism] = "optimism";
    }

    function createFork(Chains chain) public {
        vm.createFork(forks[chain]);
    }

    function createSelectFork(Chains chain) public {
        vm.createSelectFork(forks[chain]);
    }
}