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

Generate a new paper key over in the [developer panel](https://paper.xyz/dashboard/developers) by creating a new application. This key will be use to verify that the function is being called by us instead of someone else.

To do so, we provide the `onlyPaper` modifier which you can use by first inheriting from `PaperVerification` and passing instantiating it with the `_paperKey` as a param from the contractor.

```solidity

import "@paperxyz/contracts/verification/PaperVerification.sol"

contract YourNFTContract is ... , PaperVerification{

    constructor(address _paperKey, .... ) PaperVerification(_paperKey) ... { ... }

    ...
}
```

Finally to guard a method so that only we can call it, use the `onlyPaper` modifier and pass in the `MintData` parameter.

```solidity
    ...
    function paperMint(
            PaperMintData.MintData calldata _mintData,
            bytes calldata _data
        ) external onlyPaper(_mintData) {
            // your mint function here
            _safeMint(_mintData.recipient, _mintData.quantity, _data);
    }
    ...
}
```

## Full Snippet

```solidity
import "@paperxyz/contracts/verification/PaperVerification.sol"

contract YourNFTContract is ... , PaperVerification{

    constructor(address _paperKey, .... ) PaperVerification(_paperKey) ... { ... }

    ...
    function paperMint(
            PaperMintData.MintData calldata _mintData,
            bytes calldata _data
        ) external onlyPaper(_mintData) {
            // your mint function here
            _safeMint(recipient, quantity);
    }
    ...
}
```

## MintData

The Mint data is a basic solidity struct that looks like

```solidity
struct MintData {
    address recipient;
    uint256 quantity;
    uint256 tokenId;
    bytes32 nonce;
    bytes signature;
}
```

If you did not specify `tokeId` in your checkout, then `0` will be pass in by default. `nonce` and `signature` are used by paper to ensure that the same data is not used twice.

## Installation

Install the SDK with your favorite package manager `npm` or `yarn` or `pnpm`.

`npm install @paperxyz/contracts`

`yarn add @paperxyz/contracts`

`pnpm add @paperxyz/contracts`
