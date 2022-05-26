// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.11;
import "./interfaces/IBridge.sol";
import "./utils/AccessControl.sol";
import "./utils/SafeCast.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Signatures is AccessControl {
    using SafeCast for *;
    bytes32 public constant PERMIT_TYPEHASH =
        keccak256(
            "PermitBridge(uint8 domainID,uint64 depositNonce,bytes32 resourceID,bytes data)"
        );
    bytes32 public constant _TYPE_HASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    bytes32 private _HASHED_NAME = keccak256(bytes("PermitBridge"));
    bytes32 private _HASHED_VERSION = keccak256(bytes("1.0"));
    // destinationDomainID + depositNonce => dataHash => Proposal
    mapping(uint72 => mapping(bytes32 => IBridge.Proposal)) private _proposals;
    // resourceID => handler address
    mapping(bytes32 => address) public _resourceIDToHandlerAddress;

    mapping(uint8 => uint8) public _relayerThreshold;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    modifier onlyRelayers() {
        require(
            hasRole(RELAYER_ROLE, _msgSender()),
            "sender doesn't have relayer role"
        );
        _;
    }

    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "sender doesn't have admin role"
        );
        _;
    }

    function _buildDomainSeparator(
        bytes32 typeHash,
        bytes32 nameHash,
        bytes32 versionHash,
        uint256 chainId,
        address signatureContract
    ) private view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    typeHash,
                    nameHash,
                    versionHash,
                    chainId,
                    signatureContract
                )
            );
    }

    function _hashTypedDataV4(
        bytes32 structHash,
        uint256 chainId,
        address signatureContract
    ) internal view virtual returns (bytes32) {
        return
            ECDSA.toTypedDataHash(
                _buildDomainSeparator(
                    _TYPE_HASH,
                    _HASHED_NAME,
                    _HASHED_VERSION,
                    chainId,
                    signatureContract
                ),
                structHash
            );
    }

    function checkSignature(
        uint8 domainID,
        uint8 destinationDomainID,
        address destinationBridge,
        uint64 depositNonce,
        bytes32 resourceID,
        bytes calldata data,
        bytes calldata signature
    ) public view returns (bool) {
        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                domainID,
                depositNonce,
                resourceID,
                keccak256(data)
            )
        );
        bytes32 hash = _hashTypedDataV4(
            structHash,
            uint256(destinationDomainID),
            destinationBridge
        );
        address sender = ECDSA.recover(hash, signature);
        return hasRole(RELAYER_ROLE, sender);
    }

    mapping(bytes32 => bytes[]) public signatures;

    event SubmitSignature(
        uint8 indexed originDomainID,
        uint64 depositNonce,
        bytes32 indexed resourceID,
        bytes data,
        bytes signature
    );

    event SignturePass(
        uint8 indexed originDomainID,
        uint64 depositNonce,
        bytes32 indexed resourceID,
        bytes data,
        bytes signature
    );

    function getProposal(
        uint8 originDomainID,
        uint64 depositNonce,
        bytes32 dataHash
    ) internal view returns (IBridge.Proposal memory) {
        uint72 nonceAndID = (uint72(depositNonce) << 8) |
            uint72(originDomainID);
        return _proposals[nonceAndID][dataHash];
    }

    function adminSetResource(
        address handlerAddress,
        bytes32 resourceID,
        address tokenAddress
    ) external onlyAdmin {
        _resourceIDToHandlerAddress[resourceID] = handlerAddress;
    }

    function adminChangeRelayerThreshold(
        uint8 destinationDomainID,
        uint256 newThreshold
    ) external onlyAdmin {
        _relayerThreshold[destinationDomainID] = newThreshold.toUint8();
    }

    function submitSignature(
        uint8 originDomainID,
        uint8 destinationDomainID,
        address destinationBridge,
        uint64 depositNonce,
        bytes32 resourceID,
        bytes calldata data,
        bytes calldata signature
    ) external {
        address handler = _resourceIDToHandlerAddress[resourceID];
        bytes32 dataHash = keccak256(abi.encodePacked(handler, data));
        IBridge.Proposal memory proposal = getProposal(
            originDomainID,
            depositNonce,
            dataHash
        );

        require(handler != address(0), "no handler for resourceID");
        require(
            proposal._status == IBridge.ProposalStatus.Inactive,
            "ProposalStatus not inactive"
        );
        require(
            checkSignature(
                originDomainID,
                destinationDomainID,
                destinationBridge,
                depositNonce,
                resourceID,
                data,
                signature
            ),
            "invalid signature"
        );
        bytes32 depositHash = keccak256(
            abi.encode(
                originDomainID,
                depositNonce,
                resourceID,
                keccak256(data)
            )
        );
        signatures[depositHash].push(signature);
        emit SubmitSignature(
            originDomainID,
            depositNonce,
            resourceID,
            data,
            signature
        );
        if (
            signatures[depositHash].length >=
            _relayerThreshold[destinationDomainID]
        ) {
            emit SignturePass(
                originDomainID,
                depositNonce,
                resourceID,
                data,
                signature
            );
        }
    }

    function getSignatures(
        uint8 domainID,
        uint64 depositNonce,
        bytes32 resourceID,
        bytes calldata data
    ) external view returns (bytes[] memory) {
        return
            signatures[
                keccak256(
                    abi.encode(
                        domainID,
                        depositNonce,
                        resourceID,
                        keccak256(data)
                    )
                )
            ];
    }
}
