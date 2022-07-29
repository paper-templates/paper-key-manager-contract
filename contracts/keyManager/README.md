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

# Paper Key Manager

## Usage

```solidity
const YourContract {
    IPaperKeyManager paperKeyManager;
    constructor(..., address _paperKeyManagerAddress, address _paperKey) {
        // to set the initial paperKey for the contract
        paperKeyManager = IPaperKeyManager(_paperKeyManager);
        paperKeyManager.register(_paperKey);
    }
    function yourFunction(... your params, bytes32 _nonce, bytes calldata _signature) ... {
        paperKeyManager.verify(keccak256(abi.encode(...your params, _nonce)), _nonce, _signature);
    }
}
```
