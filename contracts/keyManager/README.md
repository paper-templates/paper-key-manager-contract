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

## Installation

Install the SDK with your favorite package manager `npm` or `yarn` or `pnpm`.

`npm install @paperxyz/contracts`

`yarn add @paperxyz/contracts`

`pnpm add @paperxyz/contracts`

## Usage

make sure to have the `@paperxyz/contracts` package downloaded!

```solidity
import "@paperxyz/contracts/keyManager/IPaperKeyManager.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

const YourContract {
    IPaperKeyManager paperKeyManager;

    // to set the initial paperKey for the contract
    constructor(..., address _paperKeyManagerAddress, address _paperKey) {
        paperKeyManager = IPaperKeyManager(_paperKeyManagerAddress);
    }

    // onlyPaper modifier to easily restrict multiple different function
    modifier onlyPaper(bytes32 _hash, bytes32 _nonce, bytes calldata _signature) {
        bool success = paperKeyManager.verify(_hash, _nonce, _signature);
        require(success, "Failed to verify signature");
        _;
    }
    
    function registerPaperKey(address _paperKey) external onlyOwner {
    	require(paperKeyManager.register(_paperKey), "Error registering key");
    }
  
    // using the modifier
    function yourFunction(... your params, bytes32 _nonce, bytes calldata _signature)
        onlyPaper(keccak256(abi.encode(...your params)), _nonce, _signature)
        ...
    {
        // your function
    }
}
```
