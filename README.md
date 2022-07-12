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

This package allows developers to easily integrate the `paperMint` function with paper.

## Installation

Install the SDK with your favorite package manager `npm` or `yarn` or `pnpm`.

`npm install @paperxyz/contracts`

`yarn add @paperxyz/contracts`

`pnpm add @paperxyz/contracts`

## Usage

The overall implementation will look something like this:

```solidity
import "@paperxyz/contracts/verification/PaperVerification.sol"

contract YourNFTContract is ... , PaperVerification{

    constructor(address _paperKey, .... ) PaperVerification(_paperKey) ... { ... }

    ...
    
    /// @dev paperMint function that will be called by us when a user pays with cross chain crypto // credit card
   function paperMint(
            PaperMintData.MintData calldata _mintData,
        ) external onlyPaper(_mintData) {
            // your mint function here
            _safeMint(_mintData.recipient, _mintData.quantity, _mintData.data);
    }
    
    /// @dev to update the paperKey for whatever reason.
    function setPaperKey(address _paperKey) external onlyOwner {
        // This is a function which @paperxyz/contracts exposes to update the paperKey if needed
        _setPaperKey(_paperKey);
    }
    ...
}
```

### Step by step

1. Get your paper key over in the [developer dashboard](https://paper.xyz/dashboard/developers). This key will be use to verify that the function is being called by us instead of someone else.

2. Your contract should first inheriting from `PaperVerification` and be instantiated with the paper key you got from the dashboard.

```solidity

import "@paperxyz/contracts/verification/PaperVerification.sol"

contract YourNFTContract is ... , PaperVerification{

    constructor(address _paperKey, .... ) PaperVerification(_paperKey) ... { ... }

    ...
}
```

3. Finally we use the `onlyPaper` modifier, passing it the `PaperMintData.MintData` argument from the `paperMint` function.

```solidity
    ...
    function paperMint(
            PaperMintData.MintData calldata _mintData,
        ) external onlyPaper(_mintData) {
            // your mint function here
            _safeMint(_mintData.recipient, _mintData.quantity, _mintData.data);
    }
    ...
}
```


## MintData

The Mint data is a basic Solidity struct:

```solidity
struct MintData {
    address recipient;
    uint256 quantity;
    uint256 tokenId;
    bytes32 nonce;
    bytes signature;
    bytes data;
}
```

If you did not specify `tokenId` in your checkout, then `0` will be pass in by default. `nonce` and `signature` are used by paper to ensure that a given `MintData` param is used only once.

## How it works

The `onlyPaper` modifier works by verifying the signature obtained from signing all the params (`recipient`, `quantity`, and `data` etc.) with the given `paperKey`. Thus, if we recover the `paperKey` from the signature and its parameters, we know that the `PaperMintData.MintData` argument is indeed from us since we are the only holders of the `paperKey`'s private key.
