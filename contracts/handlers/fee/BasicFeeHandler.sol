// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "../../interfaces/IFeeHandler.sol";
import "../../utils/AccessControl.sol";

/**
    @title Handles deposit fees.
    @author ChainSafe Systems.
    @notice This contract is intended to be used with the Bridge contract.
 */
contract BasicFeeHandler is IFeeHandler, AccessControl {
    address public immutable _bridgeAddress;

    uint256 public override _fee;
    mapping(uint8 => uint256) public specialFee;
    mapping(uint8 => bool) public special;

    event FeeChanged(uint256 newFee);

    modifier onlyBridge() {
        _onlyBridge();
        _;
    }

    function _onlyBridge() private view {
        require(msg.sender == _bridgeAddress, "sender must be bridge contract");
    }

    /**
        @param bridgeAddress Contract address of previously deployed Bridge.
     */
    constructor(address bridgeAddress) {
        _bridgeAddress = bridgeAddress;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
        @notice Removes admin role from {_msgSender()} and grants it to {newAdmin}.
        @notice Only callable by an address that currently has the admin role.
        @param newAdmin Address that admin role will be granted to.
     */
    function renounceAdmin(address newAdmin) external onlyAdmin {
        address sender = _msgSender();
        require(sender != newAdmin, "Cannot renounce oneself");
        grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        renounceRole(DEFAULT_ADMIN_ROLE, sender);
    }

    function setSpecialFee(uint8 fromDomainID, uint256 _specialFee)
        public
        onlyAdmin
    {
        special[fromDomainID] = true;
        specialFee[fromDomainID] = _specialFee;
    }

    /**
        @notice Collects fee for deposit.
        @param sender Sender of the deposit.
        @param destinationDomainID ID of chain deposit will be bridged to.
        @param resourceID ResourceID to be used when making deposits.
        @param depositData Additional data to be passed to specified handler.
        @param feeData Additional data to be passed to the fee handler.
     */
    function collectFee(
        address sender,
        uint8 fromDomainID,
        uint8 destinationDomainID,
        bytes32 resourceID,
        bytes calldata depositData,
        bytes calldata feeData
    ) external payable onlyBridge {
        uint256 fee = special[destinationDomainID]
            ? specialFee[destinationDomainID]
            : _fee;
        require(msg.value == fee, "Incorrect fee supplied");
        emit FeeCollected(
            sender,
            fromDomainID,
            destinationDomainID,
            resourceID,
            fee,
            address(0)
        );
    }

    /**
        @notice Calculates fee for deposit.
        @param sender Sender of the deposit.
        @param destinationDomainID ID of chain deposit will be bridged to.
        @param resourceID ResourceID to be used when making deposits.
        @param depositData Additional data to be passed to specified handler.
        @param feeData Additional data to be passed to the fee handler.
        @return Returns the fee amount.
     */
    function calculateFee(
        address sender,
        uint8 fromDomainID,
        uint8 destinationDomainID,
        bytes32 resourceID,
        bytes calldata depositData,
        bytes calldata feeData
    ) external view returns (uint256, address) {
        return (
            special[destinationDomainID]
                ? specialFee[destinationDomainID]
                : _fee,
            address(0)
        );
    }

    /**
        @notice Sets new value of the fee.
        @notice Only callable by admin.
        @param newFee Value {_fee} will be updated to.
     */
    function changeFee(uint256 newFee) external onlyAdmin {
        require(_fee != newFee, "Current fee is equal to new fee");
        _fee = newFee;
        emit FeeChanged(newFee);
    }

    /**
        @notice Transfers eth in the contract to the specified addresses. The parameters addrs and amounts are mapped 1-1.
        This means that the address at index 0 for addrs will receive the amount (in WEI) from amounts at index 0.
        @param addrs Array of addresses to transfer {amounts} to.
        @param amounts Array of amonuts to transfer to {addrs}.
     */
    function transferFee(
        address payable[] calldata addrs,
        uint256[] calldata amounts
    ) external onlyAdmin {
        require(
            addrs.length == amounts.length,
            "addrs[], amounts[]: diff length"
        );
        for (uint256 i = 0; i < addrs.length; i++) {
            (bool success, ) = addrs[i].call{value: amounts[i]}("");
            require(success, "Fee ether transfer failed");
            emit FeeDistributed(address(0), addrs[i], amounts[i]);
        }
    }

    modifier onlyAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "sender doesn't have admin role"
        );
        _;
    }
}
