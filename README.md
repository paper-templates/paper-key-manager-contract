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

Create a `Paper ERC721 primary contract`. You will receive a key which you must give a `MINTER` role or some other role which allows paper to mint for free.

After whitelisting this key, all you need to do is to initialize this key in the constructor and add a function that uses the `onlyPaper` modifier.

```solidity
import "@paperxyz/contracts/verification/PaperVerification.sol"

contract YourNFTContract is ... , PaperVerification{

    constructor(address _paperKey, .... ) PaperVerification(_paperKey) { ... }

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

## Installation

Install the SDK with your favorite package manager `npm` or `yarn` or `pnpm`.

`npm install @paperxyz/contracts`

`yarn add @paperxyz/contracts`

`pnpm add @paperxyz/contracts`
