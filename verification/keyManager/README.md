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
