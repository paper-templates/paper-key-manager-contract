// SPDX-License-Identifier: APACHE-2.0
pragma solidity ^0.8.4;

import "./PaperVerificationBase.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

// usage details
// import "@paperxyz/contracts/verification/PaperVerification.sol"
// contract YourNFTContract is ... , PaperVerification{
//     constructor(address _paperKey, .... ) PaperVerification(_paperKey) { ... }
//     ...
//     // New function
//     function paperMint(
//             address _recipient,
//             uint256 _quantity,
//             // params that you need to accept from us
//             bytes32 _nonce,
//             bytes calldata _signature
//         ) external onlyPaper(
//             // encode your function params here.
//             // Note that we use "PrimaryData" here to indicate the name type for the /struct always.
//             // Finally, we have the _nonce as the last params after all your parameters /always.
//             // Custom struct like "User" or something is not currently supported
//             abi.encode(
//                 keccak256(
//                     "PrimaryData(address recipient,uint256 quantity,bytes32 nonce)"
//                 ),
//                 _recipient,
//                 _quantity,
//                 _nonce
//             ),
//             // always like this
//             _nonce,
//             _signature
//         ) {
//             // your mint function here
//             _safeMint(_mintData.recipient, _mintData.quantity, _data);
//     }
//     ...
// }
contract PaperVerificationCustom is
    EIP712("Paper", "1"),
    PaperVerificationBase
{
    constructor(address _paperKey) PaperVerificationBase(_paperKey) {}

    modifier onlyPaper(
        bytes memory _data,
        bytes32 _nonce,
        bytes calldata _signature
    ) {
        _checkValidity(_data, _nonce, _signature, paperKey);
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
    ) internal {
        bytes32 digest = _hashTypedDataV4(keccak256(_data));
        address signer = ECDSA.recover(digest, _signature);
        require(signer == _paperKey, "Invalid signature");
        // make sure that the signature has not been used before
        require(!isMinted(_nonce), "Mint request already processed");
        minted[_nonce] = true;
    }
}
