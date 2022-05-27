// SPDX-License-Identifier: APACHE-2.0
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "./structs/PaperMintData.sol";

contract PaperVerification is EIP712("Paper", "1") {
    address private paperKey;
    mapping(bytes32 => bool) private minted;

    constructor(address _paperKey) {
        paperKey = _paperKey;
    }

    modifier onlyPaper(PaperMintData.MintData calldata _data) {
        _checkValidity(_data, paperKey);
        minted[_data.nonce] = true;
        _;
    }

    /// @notice Verifies the signature for a given MintData
    /// @dev Will revert if the signature is invalid i.e. not the paperKey passed in the constructor. Does not verify that the signer (paperKey) is authorized to mint NFTs.
    /// @param _data MintData describing the transaction details.
    function _checkValidity(
        PaperMintData.MintData calldata _data,
        address _paperKey
    ) internal view {
        bytes32 digest = _hashTypedDataV4(PaperMintData.hashData(_data));
        address signer = ECDSA.recover(digest, _data.signature);
        require(signer == _paperKey, "Invalid signature");
        // make sure that the signature has not been used before
        require(!isMinted(_data.nonce), "Mint request already processed");
    }

    function isMinted(bytes32 nonce) private view returns (bool) {
        return minted[nonce];
    }
}
