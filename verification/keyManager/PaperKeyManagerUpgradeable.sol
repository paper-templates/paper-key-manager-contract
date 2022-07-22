// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

/// @custom:security-contact team@paper.xyz
contract PaperKeyManagerUpgradeable is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    mapping(address => address) contractToPaperKeyMapping;
    mapping(address => mapping(bytes32 => bool)) contractToNoncesMapping;

    using ECDSAUpgradeable for bytes32;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function register(address _paperKey) external {
        contractToPaperKeyMapping[msg.sender] = _paperKey;
    }

    function verify(
        bytes32 hash,
        bytes32 _nonce,
        bytes calldata _signature
    ) external {
        address recoveredAddress = hash.recover(_signature);
        require(
            recoveredAddress == contractToPaperKeyMapping[msg.sender],
            "Invalid signature or hash"
        );
        require(
            !contractToNoncesMapping[msg.sender][_nonce],
            "Signature already used"
        );
        contractToNoncesMapping[msg.sender][_nonce] = true;
    }

    function update(address _contractAddress, address _newPaperKey)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        contractToPaperKeyMapping[_contractAddress] = _newPaperKey;
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}
}
