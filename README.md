<p align="center">
    <br />
    <a href="https://paper.xyz"><img src="https://raw.githubusercontent.com/paperxyz/react-client-sdk/main/assets/paper-logo.svg" width="100" alt=""/></a>
    <br />
</p>
<h1 align="center">Paper Contracts</h1>
<p align="center">
    <a href="https://www.npmjs.com/package/@paperxyz/contracts"><img src="https://img.shields.io/github/package-json/v/paperxyz/contracts?color=red&label=npm&logo=npm" alt="npm version"/></a>
    <a href="https://discord.gg/mnUa29J2Fp"><img alt="Join our Discord!" src="https://img.shields.io/discord/936354866358546453.svg?color=7289da&label=discord&logo=discord&style=flat"/></a>
</p>

[Paper](https://paper.xyz) is a developer-first NFT checkout solution that easily onboards users without wallets or cryptocurrencies.

This package allows developers to easily integrate their solidity smart contracts with paper.

## Usage

Create a `Paper ERC721 primary contract`. You will receive a key which you should give a privileged role. This key will be use to verify that the contract is being called by us instead of someone else.

After whitelisting this key, all you need to do is to initialize this key in the constructor.

```solidity

import "@paperxyz/contracts/verification/PaperVerification.sol"

contract YourNFTContract is ... , PaperVerification{

    constructor(address _paperKey, .... ) PaperVerification(_paperKey) ... { ... }

    ...
}
```

Finally to guard a method so that only we can call it, use the `onlyPaper` modifier.

There are some pointers when calling the `onlyPaper` functions as documented inline with the code.

```solidity
import "@paperxyz/contracts/verification/PaperVerification.sol"

contract YourNFTContract is ... , PaperVerification{

    constructor(address _paperKey, .... ) PaperVerification(_paperKey) { ... }

    ...
    // New function
    function paperMint(
            address _recipient,
            uint256 _quantity,

            // params that you need to accept from us
            bytes32 _nonce,
            bytes calldata _signature
        ) external onlyPaper(
            // encode your function params here.
            // Note that we use "PrimaryData" here to indicate the name type for the struct always.
            // Finally, we have the _nonce as the last params after all your parameters always.
            // Custom struct like "User" or something is not currently supported
            abi.encode(
                keccak256(
                    "PrimaryData(address recipient,uint256 quantity,bytes32 nonce)"
                ),
                _recipient,
                _quantity,
                _nonce
            ),
            // always like this
            _nonce,
            _signature
        ) {
            // your mint function here
            _safeMint(_mintData.recipient, _mintData.quantity, _data);
    }

    ...
}
```

## Installation

Install the SDK with your favorite package manager `npm` or `yarn` or `pnpm`.

`npm install @paperxyz/contracts`

`yarn add @paperxyz/contracts`

`pnpm add @paperxyz/contracts`
