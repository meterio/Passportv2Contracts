// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.11;

import {SafeMathUpgradeable as SafeMath} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import {IERC721Upgradeable as IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import {ERC721MinterBurnerPauserUpgradeable as ERC721MinterBurnerPauser} from "./ERC721MinterBurnerPauserUpgradeable.sol";

/**
    @title Manages deposited ERC721s.
    @author ChainSafe Systems.
    @notice This contract is intended to be used with ERC721Handler contract.
 */
contract ERC721SafeUpgradeable {
    using SafeMath for uint256;

    /**
        @notice Used to gain custoday of deposited token.
        @param tokenAddress Address of ERC721 to transfer.
        @param owner Address of current token owner.
        @param recipient Address to transfer token to.
        @param tokenID ID of token to transfer.
     */
    function lockERC721(
        address tokenAddress,
        address owner,
        address recipient,
        uint256 tokenID
    ) internal {
        IERC721 erc721 = IERC721(tokenAddress);
        erc721.transferFrom(owner, recipient, tokenID);
    }

    /**
        @notice Transfers custody of token to recipient.
        @param tokenAddress Address of ERC721 to transfer.
        @param owner Address of current token owner.
        @param recipient Address to transfer token to.
        @param tokenID ID of token to transfer.
     */
    function releaseERC721(
        address tokenAddress,
        address owner,
        address recipient,
        uint256 tokenID
    ) internal {
        IERC721 erc721 = IERC721(tokenAddress);
        erc721.transferFrom(owner, recipient, tokenID);
    }

    /**
        @notice Used to create new ERC721s.
        @param tokenAddress Address of ERC721 to mint.
        @param recipient Address to mint token to.
        @param tokenID ID of token to mint.
        @param data Optional data to send along with mint call.
     */
    function mintERC721(
        address tokenAddress,
        address recipient,
        uint256 tokenID,
        bytes memory data
    ) internal {
        ERC721MinterBurnerPauser erc721 = ERC721MinterBurnerPauser(
            tokenAddress
        );
        erc721.mint(recipient, tokenID, string(data));
    }

    /**
        @notice Used to burn ERC721s.
        @param tokenAddress Address of ERC721 to burn.
        @param tokenID ID of token to burn.
     */
    function burnERC721(address tokenAddress, uint256 tokenID) internal {
        ERC721MinterBurnerPauser erc721 = ERC721MinterBurnerPauser(
            tokenAddress
        );
        erc721.burn(tokenID);
    }
}
