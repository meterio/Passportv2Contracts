// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.11;
import "./interfaces/IBridge.sol";

contract Signatures {
    address public bridge;

    constructor(address _bridge) {
        bridge = _bridge;
    }

    mapping(bytes32 => bytes[]) public signatures;

    function submitSignature(
        uint8 domainID,
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
            domainID,
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
                domainID,
                depositNonce,
                resourceID,
                data,
                signature
            ),
            "invalid signature"
        );
        signatures[
            keccak256(
                abi.encode(
                    domainID,
                    depositNonce,
                    resourceID,
                    keccak256(data)
                )
            )
        ].push(signature);
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
