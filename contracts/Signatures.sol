// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.11;
import "./interfaces/IBridge.sol";

contract Signatures {
    address public bridge;

    constructor(address _bridge) {
        bridge = _bridge;
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

    function submitSignature(
        uint8 originDomainID,
        uint64 depositNonce,
        bytes32 resourceID,
        bytes calldata data,
        bytes calldata signature
    ) external {
        address handler = IBridge(bridge)._resourceIDToHandlerAddress(
            resourceID
        );
        bytes32 dataHash = keccak256(abi.encodePacked(handler, data));
        IBridge.Proposal memory proposal = IBridge(bridge).getProposal(
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
            IBridge(bridge).checkSignature(
                originDomainID,
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
            IBridge(bridge)._relayerThreshold()
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
