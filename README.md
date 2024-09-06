<div align="center">
<img src="https://omnigas.vercel.app/favicon.ico" width="100"/>
<h1 align="center" style="margin-bottom: 0">ERC-4337 Smart Wallet controlled with Passkeys</h1>
<p align="center">An All-in-one App that let you abstract all the difficulties of the blockchain</a></p>
</div>

![Login](https://github.com/user-attachments/assets/dffdbb25-e89f-4309-9ad1-50063216004d)

# Smart Contracts
## Supported Chains
- Optimism Sepolia
- Arbitrum Sepolia

## Factory
```
0xaCea7eD933a39B18E30C9F899a97787669f55752
```

## P256 Verifier
```
0x3AB1BDed845DE299EcC4A8E5aB6AF2AB10860F04
```

## Paymaster
### Arbitrum
```
0xe2A1e611c180fd59d930808Bbb1B76BBc9fC0583
```
### Optimism
```
0x79ef52595911F4914135ea8e76977446653d7bED
```

# [Demo Site](https://omnigas.vercel.app/)

# Project Summary

Onboarding new users into blockchain applications is a challenge. Current solutions revolves around mnemonics that need to be stored to recover accounts on users wallets, effectively introducing security risks. By using passkeys to control accounts, we abstract away the need for users to store mnemonics and we allow users to use a familiar interface to control their accounts (biometric authentication) in one click UX.

Our wallet is meant to be an implementation of the [ERC-4337 standard](https://github.com/eth-infinitism/account-abstraction), that allow users to have an account in the form of a smart contract. In this case, we use passkeys to let users control their account thanks to the onchain P256 signature verification developed by [Daimo](https://github.com/daimo-eth/p256-verifier).

</br>

# Key Features and Technologies

1 - ERC-4337 Implementation:
    Adopts the ERC-4337 standard for account abstraction, enhancing wallet flexibility and user experience.

2 - Biometric Authentication:
    Utilizes WebAuthn for biometric signatures, replacing the traditional 12-word seed phrase. Enhances security while simplifying the user authentication process.

3 - Flexible Gas Fee Payment Options:
    Supports multiple payment methods for transaction fees: Native blockchain tokens, ERC-20 tokens on the same blockchain, ERC-20 tokens from different blockchains (cross-chain functionality), Sponsored transactions (gasless for the end-user)

4 - WalletConnect Integration:
    Enables seamless connection to decentralized applications (dApps) using the WalletConnect protocol.

5 - Direct DeFi Interactions:
    Built-in integration with popular DeFi platforms like Aave, allowing users to interact directly from the wallet interface.

6 - Cross-Chain Compatibility:
   Designed to work across multiple blockchain networks, simplifying the management of assets on different chains.

7 - User-Centric Design:
Focuses on maintaining a simple, intuitive interface while providing access to advanced blockchain features.


Project Goals:
 - Simplify the onboarding process for new users entering the blockchain space.
 - Enhance security through biometric authentication, reducing the risk of lost or stolen private keys.
 - Provide a versatile solution for gas fee payments, accommodating various user preferences and token holdings.
 - Create a seamless experience for interacting with dApps and DeFi protocols.
 - Offer cross-chain functionality without overwhelming users with technical complexities.

# How It Works

![How it works](https://github.com/user-attachments/assets/9c4103d2-8306-4873-807e-dc96329d4b19)

