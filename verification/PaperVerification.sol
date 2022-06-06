// SPDX-License-Identifier: APACHE-2.0
pragma solidity >=0.8.9 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract PaperVerification is EIP712("Paper", "1") {
    address private paperKey;
    mapping(bytes32 => bool) private minted;

    constructor(address _paperKey) {
        paperKey = _paperKey;
    }

    modifier onlyPaper(
        bytes memory _data,
        bytes32 _nonce,
        bytes calldata _signature
    ) {
        _checkValidity(_data, _nonce, _signature, paperKey);
        minted[_nonce] = true;
        _;
    }

    /// @notice Verifies the signature for a given MintData
    /// @dev Will revert if the signature is invalid i.e. not the paperKey passed in the constructor. Does not verify that the signer (paperKey) is authorized to mint NFTs.
    /// @param _data MintData describing the transaction details.
    function _checkValidity(
        bytes memory _data,
        bytes32 _nonce,
        bytes calldata _signature,
        address _paperKey
    ) internal view {
        bytes32 digest = _hashTypedDataV4(keccak256(_data));
        address signer = ECDSA.recover(digest, _signature);
        require(signer == _paperKey, "Invalid signature");
        // make sure that the signature has not been used before
        require(!isMinted(_nonce), "Mint request already processed");
    }

    function isMinted(bytes32 nonce) private view returns (bool) {
        return minted[nonce];
    }

    /// @notice Updates the paper key that is use to verify in {_checkValidity}.
    /// @dev Should only be able to be called by trusted addresses
    /// @param _paperKey The new paper key to use for verification
    function _setPaperKey(address _paperKey) internal {
        paperKey = _paperKey;
    }

    function getPaperKey() public view returns (address) {
        return paperKey;
    }
}
