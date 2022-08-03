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

[Paper](https://paper.xyz) is a developer-first NFT checkout solution that easily onboard users without wallets or cryptocurrencies.

This package allows developers to easily implement signature minting where Paper manages all the key used in signing

## Installation

Install the SDK with your favorite package manager `npm` or `yarn` or `pnpm`.

`npm install @paperxyz/contracts`

`yarn add @paperxyz/contracts`

`pnpm add @paperxyz/contracts`

## Usage

High level overview for the various contracts. For more information, check directly in the contract folder's readme.

- `PaperVerification` - Deprecated in favour for `PaperKeyManager`. Current customers will continue to be supported. New Customers will have to use `PaperKeyManager`.
- `PaperKeyManager`- Used to allow users to easily restrict certain function to only Paper.
