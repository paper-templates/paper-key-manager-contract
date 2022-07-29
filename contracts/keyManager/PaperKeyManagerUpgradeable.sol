// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

/// @custom:security-contact team@paper.xyz
contract PaperKeyManagerUpgradeable is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    mapping(address => address) private contractToPaperKeyMapping;
    mapping(address => mapping(bytes32 => bool))
        private contractToNoncesMapping;

    using ECDSAUpgradeable for bytes32;

    event RegisterdPaperKey(
        address indexed contractAddress,
        address indexed paperKey
    );
    event UpdatedPaperKey(
        address indexed contractAddress,
        address indexed paperKey
    );
    event DeletedPaperKey(address indexed contractAddress);

    modifier batchCallCompliant(
        address[] calldata _contracts,
        address[] calldata _paperKey
    ) {
        require(
            _contracts.length == _paperKey.length,
            "_contracts and _paperKey arguments have different length"
        );
        require(
            _contracts.length < 200,
            "Trying to update to many contracts at once"
        );
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function register(address _paperKey) external {
        contractToPaperKeyMapping[msg.sender] = _paperKey;
        emit RegisterdPaperKey(msg.sender, _paperKey);
    }

    function registerBatch(
        address[] calldata _contracts,
        address[] calldata _paperKey
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _contracts.length == _paperKey.length,
            "_contracts and _paperKey arguments have different length"
        );
        require(
            _contracts.length < 200,
            "Trying to update to many contracts at once"
        );
        for (uint8 i = 0; i < _contracts.length; ++i) {
            address contractAddress = _contracts[i];
            address paperKey = _paperKey[i];
            contractToPaperKeyMapping[contractAddress] = paperKey;
            emit RegisterdPaperKey(contractAddress, paperKey);
        }
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

    function updateBatch(
        address[] calldata _contracts,
        address[] calldata _paperKey
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _contracts.length == _paperKey.length,
            "_contracts and _paperKey arguments have different length"
        );
        require(
            _contracts.length < 200,
            "Trying to update to many contracts at once"
        );
        for (uint8 i = 0; i < _contracts.length; ++i) {
            address contractAddress = _contracts[i];
            address paperKey = _paperKey[i];
            contractToPaperKeyMapping[contractAddress] = paperKey;
            emit RegisterdPaperKey(contractAddress, paperKey);
        }
    }

    function remove(address _contractAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        delete contractToPaperKeyMapping[_contractAddress];
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
    {}
}
