// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.11;

import {AccessControlUpgradeable as AccessControl} from "./utils/AccessControlUpgradeable.sol";
import "./utils/PausableUpgradeable.sol";
import "./utils/SafeMath.sol";
import "./utils/SafeCast.sol";
import "./interfaces/IDepositExecute.sol";
import "./interfaces/IERCHandler.sol";
import "./interfaces/IGenericHandler.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IBridge.sol";
import "./interfaces/IFeeHandler.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";

/**
    @title Facilitates deposits, creation and voting of deposit proposals, and deposit executions.
    @author ChainSafe Systems.
 */
contract BridgeUpgradeable is
    EIP712Upgradeable,
    PausableUpgradeable,
    AccessControl,
    SafeMath,
    IBridge
{
    using SafeCast for *;

    bytes32 public constant PERMIT_TYPEHASH =
        keccak256(
            "PermitBridge(uint8 domainID,uint64 depositNonce,bytes32 resourceID,bytes data)"
        );

    // Limit relayers number because proposal can fit only so much votes
    uint256 public constant MAX_RELAYERS = 200;

    uint8 public _domainID;
    uint8 public _relayerThreshold;
    uint40 public _expiry;

    IFeeHandler public _feeHandler; // scrap

    // destinationDomainID => number of deposits
    mapping(uint8 => uint64) public _depositCounts;
    // resourceID => handler address
    mapping(bytes32 => address) public _resourceIDToHandlerAddress;
    // forwarder address => is Valid
    mapping(address => bool) public isValidForwarder;
    // destinationDomainID + depositNonce => dataHash => Proposal
    mapping(uint72 => mapping(bytes32 => Proposal)) private _proposals;

    // fees
    uint256 public _fee_;
    uint256 public _feeReserve;
    mapping(uint8 => uint256) public specialFee;
    mapping(uint8 => bool) public special;

    event RelayerThresholdChanged(uint256 newThreshold);
    event RelayerAdded(address relayer);
    event RelayerRemoved(address relayer);
    event FeeHandlerChanged(address newFeeHandler);
    event Deposit(
        uint8 destinationDomainID,
        bytes32 resourceID,
        uint64 depositNonce,
        address indexed user,
        bytes data,
        bytes handlerResponse
    );
    event ProposalEvent(
        uint8 originDomainID,
        uint64 depositNonce,
        ProposalStatus status,
        bytes32 dataHash
    );
    event ProposalVote(
        uint8 originDomainID,
        uint64 depositNonce,
        ProposalStatus status,
        bytes32 dataHash
    );
    event FailedHandlerExecution(bytes lowLevelData);

    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    modifier onlyAdmin() {
        _onlyAdmin();
        _;
    }

    modifier onlyAdminOrRelayer() {
        _onlyAdminOrRelayer();
        _;
    }

    modifier onlyRelayers() {
        _onlyRelayers();
        _;
    }

    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
        _;
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    function _fee() external view returns (uint256) {
        return _fee_;
    }

    function _chainId() external view returns (uint256) {
        return block.chainid;
    }

    function _onlyAdminOrRelayer() private view {
        address sender = _msgSender();
        require(
            hasRole(DEFAULT_ADMIN_ROLE, sender) ||
                hasRole(RELAYER_ROLE, sender),
            "sender is not relayer or admin"
        );
    }

    function _onlyAdmin() private view {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "sender doesn't have admin role"
        );
    }

    function _onlyRelayers() private view {
        require(
            hasRole(RELAYER_ROLE, _msgSender()),
            "sender doesn't have relayer role"
        );
    }

    function _relayerBit(address relayer) private view returns (uint256) {
        return
            uint256(1) <<
            sub(AccessControl.getRoleMemberIndex(RELAYER_ROLE, relayer), 1);
    }

    function _hasVoted(Proposal memory proposal, address relayer)
        private
        view
        returns (bool)
    {
        return (_relayerBit(relayer) & uint256(proposal._yesVotes)) > 0;
    }

    function _msgSender() internal view override returns (address) {
        address signer = msg.sender;
        if (msg.data.length >= 20 && isValidForwarder[signer]) {
            assembly {
                signer := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        }
        return signer;
    }

    /**
        @notice Initializes Bridge, creates and grants {_msgSender()} the admin role,
        creates and grants {initialRelayers} the relayer role.
        @param domainID ID of chain the Bridge contract exists on.
        @param initialRelayers Addresses that should be initially granted the relayer role.
        @param initialRelayerThreshold Number of votes needed for a deposit proposal to be considered passed.
     */
    function initialize(
        uint8 domainID,
        address[] memory initialRelayers,
        uint256 initialRelayerThreshold,
        uint256 expiry,
        address admin
    ) public initializer {
        __Pausable_init();
        __EIP712_init("PermitBridge", "1.0");
        _domainID = domainID;
        _relayerThreshold = initialRelayerThreshold.toUint8();
        _expiry = expiry.toUint40();

        _setupRole(DEFAULT_ADMIN_ROLE, admin);

        for (uint256 i; i < initialRelayers.length; i++) {
            grantRole(RELAYER_ROLE, initialRelayers[i]);
        }
        _status = _NOT_ENTERED;
    }

    /**
        @notice Returns true if {relayer} has voted on {destNonce} {dataHash} proposal.
        @notice Naming left unchanged for backward compatibility.
        @param destNonce destinationDomainID + depositNonce of the proposal.
        @param dataHash Hash of data to be provided when deposit proposal is executed.
        @param relayer Address to check.
     */
    function _hasVotedOnProposal(
        uint72 destNonce,
        bytes32 dataHash,
        address relayer
    ) public view returns (bool) {
        return _hasVoted(_proposals[destNonce][dataHash], relayer);
    }

    /**
        @notice Returns true if {relayer} has the relayer role.
        @param relayer Address to check.
     */
    function isRelayer(address relayer) external view returns (bool) {
        return hasRole(RELAYER_ROLE, relayer);
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

    /**
        @notice Pauses deposits, proposal creation and voting, and deposit executions.
        @notice Only callable by an address that currently has the admin role.
     */
    function adminPauseTransfers() external onlyAdmin {
        _pause(_msgSender());
    }

    /**
        @notice Unpauses deposits, proposal creation and voting, and deposit executions.
        @notice Only callable by an address that currently has the admin role.
     */
    function adminUnpauseTransfers() external onlyAdmin {
        _unpause(_msgSender());
    }

    /**
        @notice Modifies the number of votes required for a proposal to be considered passed.
        @notice Only callable by an address that currently has the admin role.
        @param newThreshold Value {_relayerThreshold} will be changed to.
        @notice Emits {RelayerThresholdChanged} event.
     */
    function adminChangeRelayerThreshold(uint256 newThreshold)
        external
        onlyAdmin
    {
        _relayerThreshold = newThreshold.toUint8();
        emit RelayerThresholdChanged(newThreshold);
    }

    /**
        @notice Grants {relayerAddress} the relayer role.
        @notice Only callable by an address that currently has the admin role, which is
                checked in grantRole().
        @param relayerAddress Address of relayer to be added.
        @notice Emits {RelayerAdded} event.
     */
    function adminAddRelayer(address relayerAddress) external onlyAdmin {
        require(_totalRelayers() < MAX_RELAYERS, "relayers limit reached");
        grantRole(RELAYER_ROLE, relayerAddress);
        emit RelayerAdded(relayerAddress);
    }

    /**
        @notice Removes relayer role for {relayerAddress}.
        @notice Only callable by an address that currently has the admin role, which is
                checked in revokeRole().
        @param relayerAddress Address of relayer to be removed.
        @notice Emits {RelayerRemoved} event.
     */
    function adminRemoveRelayer(address relayerAddress)
        external
        onlyAdmin
        whenPaused
    {
        revokeRole(RELAYER_ROLE, relayerAddress);
        emit RelayerRemoved(relayerAddress);
    }

    function renounceRole(bytes32 role, address account)
        public
        override
        whenPaused
    {
        super.renounceRole(role, account);
    }

    /**
        @notice Sets a new resource for handler contracts that use the IERCHandler interface,
        and maps the {handlerAddress} to {resourceID} in {_resourceIDToHandlerAddress}.
        @notice Only callable by an address that currently has the admin role.
        @param handlerAddress Address of handler resource will be set for.
        @param resourceID ResourceID to be used when making deposits.
        @param tokenAddress Address of contract to be called when a deposit is made and a deposited is executed.
     */
    function adminSetResource(
        address handlerAddress,
        bytes32 resourceID,
        address tokenAddress
    ) external onlyAdmin {
        _resourceIDToHandlerAddress[resourceID] = handlerAddress;
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.setResource(resourceID, tokenAddress);
    }

    function adminSetNativeResource(address handlerAddress) external onlyAdmin {
        address tokenAddress = address(uint160(_domainID));
        bytes32 resourceID = bytes32(
            uint256(uint160(tokenAddress)) * 256 + _domainID
        );
        _resourceIDToHandlerAddress[resourceID] = handlerAddress;
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.setResource(resourceID, tokenAddress);
        handler.setNative(tokenAddress, true);
    }

    /**
        @notice Sets a new resource for handler contracts that use the IGenericHandler interface,
        and maps the {handlerAddress} to {resourceID} in {_resourceIDToHandlerAddress}.
        @notice Only callable by an address that currently has the admin role.
        @param handlerAddress Address of handler resource will be set for.
        @param resourceID ResourceID to be used when making deposits.
        @param contractAddress Address of contract to be called when a deposit is made and a deposited is executed.
        @param depositFunctionSig Function signature of method to be called in {contractAddress} when a deposit is made.
        @param depositFunctionDepositorOffset Depositor address position offset in the metadata, in bytes.
        @param executeFunctionSig Function signature of method to be called in {contractAddress} when a deposit is executed.
     */
    function adminSetGenericResource(
        address handlerAddress,
        bytes32 resourceID,
        address contractAddress,
        bytes4 depositFunctionSig,
        uint256 depositFunctionDepositorOffset,
        bytes4 executeFunctionSig
    ) external onlyAdmin {
        _resourceIDToHandlerAddress[resourceID] = handlerAddress;
        IGenericHandler handler = IGenericHandler(handlerAddress);
        handler.setResource(
            resourceID,
            contractAddress,
            depositFunctionSig,
            depositFunctionDepositorOffset,
            executeFunctionSig
        );
    }

    function adminRemoveResourceId(bytes32 resourceID, address tokenAddress)
        external
        onlyAdmin
    {
        address handlerAddress = _resourceIDToHandlerAddress[resourceID];
        delete _resourceIDToHandlerAddress[resourceID];
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.removeResource(resourceID, tokenAddress);
    }

    function adminRemoveNativeResourceId() external onlyAdmin {
        address tokenAddress = address(uint160(_domainID));
        bytes32 resourceID = bytes32(
            uint256(uint160(tokenAddress)) * 256 + _domainID
        );
        address handlerAddress = _resourceIDToHandlerAddress[resourceID];
        delete _resourceIDToHandlerAddress[resourceID];

        IERCHandler handler = IERCHandler(handlerAddress);
        handler.setNative(tokenAddress, false);
        handler.removeResource(resourceID, tokenAddress);
    }

    function adminRemoveGenericResource(
        bytes32 resourceID,
        address contractAddress
    ) external onlyAdmin {
        address handlerAddress = _resourceIDToHandlerAddress[resourceID];
        delete _resourceIDToHandlerAddress[resourceID];
        IGenericHandler handler = IGenericHandler(handlerAddress);
        handler.removeResource(resourceID, contractAddress);
    }

    /**
        @notice Sets a resource as burnable for handler contracts that use the IERCHandler interface.
        @notice Only callable by an address that currently has the admin role.
        @param handlerAddress Address of handler resource will be set for.
        @param tokenAddress Address of contract to be called when a deposit is made and a deposited is executed.
     */
    function adminSetBurnable(address handlerAddress, address tokenAddress)
        external
        onlyAdmin
    {
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.setBurnable(tokenAddress);
    }

    /**
        @notice Sets the nonce for the specific domainID.
        @notice Only callable by an address that currently has the admin role.
        @param domainID Domain ID for increasing nonce.
        @param nonce The nonce value to be set.
     */
    function adminSetDepositNonce(uint8 domainID, uint64 nonce)
        external
        onlyAdmin
    {
        require(
            nonce > _depositCounts[domainID],
            "Does not allow decrements of the nonce"
        );
        _depositCounts[domainID] = nonce;
    }

    /**
        @notice Set a forwarder to be used.
        @notice Only callable by an address that currently has the admin role.
        @param forwarder Forwarder address to be added.
        @param valid Decision for the specific forwarder.
     */
    function adminSetForwarder(address forwarder, bool valid)
        external
        onlyAdmin
    {
        isValidForwarder[forwarder] = valid;
    }

    function adminSetNative(
        bytes32 resourceID,
        address nativeAddress,
        bool isNative
    ) external onlyAdmin {
        IERCHandler handler = IERCHandler(
            _resourceIDToHandlerAddress[resourceID]
        );
        handler.setNative(nativeAddress, isNative);
    }

    function adminSetDomainId(uint8 domainID) external onlyAdmin {
        _domainID = domainID;
    }

    function adminSetSpecialFee(uint8 destinationDomainID, uint256 _specialFee)
        public
        onlyAdmin
    {
        special[destinationDomainID] = true;
        specialFee[destinationDomainID] = _specialFee;
    }

    function adminRemoveSpecialFee(uint8 destinationDomainID) public onlyAdmin {
        delete special[destinationDomainID];
        delete specialFee[destinationDomainID];
    }

    event FeeChanged(uint256 newFee);

    /**
        @notice Sets new value of the fee.
        @notice Only callable by admin.
        @param newFee Value {_fee} will be updated to.
     */
    function adminSetFee(uint256 newFee) external onlyAdmin {
        require(_fee_ != newFee, "Current fee is equal to new fee");
        _fee_ = newFee;
        emit FeeChanged(newFee);
    }

    function _getFee(uint8 destinationDomainID)
        internal
        view
        returns (uint256)
    {
        if (special[destinationDomainID]) {
            return specialFee[destinationDomainID];
        } else {
            return _fee_;
        }
    }

    function getFee(uint8 destinationDomainID) external view returns (uint256) {
        return _getFee(destinationDomainID);
    }

    /**
        @notice Returns a proposal.
        @param originDomainID Chain ID deposit originated from.
        @param depositNonce ID of proposal generated by proposal's origin Bridge contract.
        @param resourceID ResourceID used to find address of handler to be used for deposit.
        @return Proposal which consists of:
        - _dataHash Hash of data to be provided when deposit proposal is executed.
        - _yesVotes Number of votes in favor of proposal.
        - _noVotes Number of votes against proposal.
        - _status Current status of proposal.
     */
    function getProposal(
        uint8 originDomainID,
        uint64 depositNonce,
        bytes32 resourceID,
        bytes calldata data
    ) external view returns (Proposal memory) {
        address handler = _resourceIDToHandlerAddress[resourceID];
        bytes32 dataHash = keccak256(
            abi.encodePacked(resourceID, handler, data)
        );
        uint72 nonceAndID = (uint72(depositNonce) << 8) |
            uint72(originDomainID);
        return _proposals[nonceAndID][dataHash];
    }

    /**
        @notice Returns total relayers number.
        @notice Added for backwards compatibility.
     */
    function _totalRelayers() public view returns (uint256) {
        return AccessControl.getRoleMemberCount(RELAYER_ROLE);
    }

    function adminChangeExpiry(uint256 expiry) external onlyAdmin {
        _expiry = expiry.toUint40();
    }

    /**
        @notice Used to manually withdraw funds from ERC safes.
        @param handlerAddress Address of handler to withdraw from.
        @param data ABI-encoded withdrawal params relevant to the specified handler.
     */
    function adminWithdraw(address handlerAddress, bytes memory data)
        external
        onlyAdmin
    {
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.withdraw(data);
    }

    function adminWithdrawETH(address handlerAddress, bytes memory data)
        external
        onlyAdmin
    {
        IERCHandler handler = IERCHandler(handlerAddress);
        handler.withdrawETH(data);
    }

    event FeeDistributed(
        address tokenAddress,
        address recipient,
        uint256 amount
    );

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

    error IncorrectFeeSupplied(uint256 msgValue, uint256 fee);
    error ResourceIDNotMappedToHandler();

    /**
        @notice Initiates a transfer using a specified handler contract.
        @notice Only callable when Bridge is not paused.
        @param destinationDomainID ID of chain deposit will be bridged to.
        @param resourceID ResourceID used to find address of handler to be used for deposit.
        @param depositData Additional data to be passed to specified handler.
        @param feeData Additional data to be passed to the fee handler.
        @notice Emits {Deposit} event with all necessary parameters and a handler response.
        - ERC20Handler: responds with an empty data.
        - ERC721Handler: responds with the deposited token metadata acquired by calling a tokenURI method in the token contract.
        - GenericHandler: responds with the raw bytes returned from the call to the target contract.
     */
    function deposit(
        uint8 destinationDomainID,
        bytes32 resourceID,
        bytes calldata depositData,
        bytes calldata feeData
    ) external payable whenNotPaused {
        address sender = _msgSender();
        _deposit(sender, destinationDomainID, resourceID, depositData, feeData);
    }

    function _deposit(
        address sender,
        uint8 destinationDomainID,
        bytes32 resourceID,
        bytes calldata depositData,
        bytes calldata feeData
    ) private {
        uint256 value = msg.value;
        uint256 fee = _getFee(destinationDomainID);
        value -= fee;
        _feeReserve += fee;

        address handler = _resourceIDToHandlerAddress[resourceID];
        if (handler == address(0)) {
            revert ResourceIDNotMappedToHandler();
        }

        uint64 depositNonce = ++_depositCounts[destinationDomainID];
        bytes memory handlerResponse = IDepositExecute(handler).deposit{
            value: value
        }(resourceID, sender, depositData);

        emit Deposit(
            destinationDomainID,
            resourceID,
            depositNonce,
            sender,
            depositData,
            handlerResponse
        );
    }

    error InvalidSignature(address signer, uint256 index);

    function checkSignature(
        uint8 domainID,
        uint64 depositNonce,
        bytes32 resourceID,
        bytes calldata data,
        bytes calldata signature
    ) external view returns (bool) {
        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                domainID,
                depositNonce,
                resourceID,
                keccak256(data)
            )
        );
        bytes32 hash = _hashTypedDataV4(structHash);
        address sender = ECDSAUpgradeable.recover(hash, signature);
        return hasRole(RELAYER_ROLE, sender);
    }

    function voteProposals(
        uint8 domainID,
        uint64 depositNonce,
        bytes32 resourceID,
        bytes calldata data,
        bytes[] memory signatures
    ) external whenNotPaused nonReentrant{
        address handler = _resourceIDToHandlerAddress[resourceID];
        require(handler != address(0), "no handler for resourceID");
        bytes32 dataHash = keccak256(
            abi.encodePacked(resourceID, handler, data)
        );
        uint256 length = signatures.length;
        require(
            length >= _relayerThreshold,
            "Signatures length >= relayerThreshold"
        );
        Proposal memory proposal = Proposal({
            _status: ProposalStatus.Active,
            _yesVotes: 0,
            _yesVotesTotal: 0,
            _proposedBlock: uint40(block.number) // Overflow is desired.
        });

        bytes32 hash = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    PERMIT_TYPEHASH,
                    domainID,
                    depositNonce,
                    resourceID,
                    keccak256(data)
                )
            )
        );

        for (uint256 i; i < length; ++i) {
            address signer = ECDSAUpgradeable.recover(hash, signatures[i]);
            if (!hasRole(RELAYER_ROLE, signer)) {
                revert InvalidSignature(signer, i);
            }

            require(!_hasVoted(proposal, signer), "relayer already voted");
            proposal._yesVotes = (proposal._yesVotes | _relayerBit(signer))
                .toUint200();
            proposal._yesVotesTotal++; // TODO: check if bit counting is cheaper.
        }
        proposal._status = ProposalStatus.Executed;
        IDepositExecute depositHandler = IDepositExecute(handler);
        depositHandler.executeProposal(resourceID, data);
        emit ProposalEvent(
            domainID,
            depositNonce,
            ProposalStatus.Executed,
            dataHash
        );

        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(domainID);
        require(
            uint256(_proposals[nonceAndID][dataHash]._status) <= 1,
            "proposal already executed/cancelled"
        );
        _proposals[nonceAndID][dataHash] = proposal;
    }

    /**
        @notice When called, {_msgSender()} will be marked as voting in favor of proposal.
        @notice Only callable by relayers when Bridge is not paused.
        @param domainID ID of chain deposit originated from.
        @param depositNonce ID of deposited generated by origin Bridge contract.
        @param data Data originally provided when deposit was made.
        @notice Proposal must not have already been passed or executed.
        @notice {_msgSender()} must not have already voted on proposal.
        @notice Emits {ProposalEvent} event with status indicating the proposal status.
        @notice Emits {ProposalVote} event.
     */
    function voteProposal(
        uint8 domainID,
        uint64 depositNonce,
        bytes32 resourceID,
        bytes calldata data
    ) external onlyRelayers whenNotPaused nonReentrant {
        address handler = _resourceIDToHandlerAddress[resourceID];
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(domainID);
        bytes32 dataHash = keccak256(
            abi.encodePacked(resourceID, handler, data)
        );
        Proposal memory proposal = _proposals[nonceAndID][dataHash];

        require(
            _resourceIDToHandlerAddress[resourceID] != address(0),
            "no handler for resourceID"
        );

        if (proposal._status == ProposalStatus.Passed) {
            _executeProposal(domainID, depositNonce, data, resourceID, true);
            return;
        }

        address sender = _msgSender();

        require(
            uint256(proposal._status) <= 1,
            "proposal already executed/cancelled"
        );
        require(!_hasVoted(proposal, sender), "relayer already voted");

        if (proposal._status == ProposalStatus.Inactive) {
            proposal = Proposal({
                _status: ProposalStatus.Active,
                _yesVotes: 0,
                _yesVotesTotal: 0,
                _proposedBlock: uint40(block.number) // Overflow is desired.
            });

            emit ProposalEvent(
                domainID,
                depositNonce,
                ProposalStatus.Active,
                dataHash
            );
        } else if (
            uint40(sub(block.number, proposal._proposedBlock)) > _expiry
        ) {
            // if the number of blocks that has passed since this proposal was
            // submitted exceeds the expiry threshold set, cancel the proposal
            proposal._status = ProposalStatus.Cancelled;

            emit ProposalEvent(
                domainID,
                depositNonce,
                ProposalStatus.Cancelled,
                dataHash
            );
        }

        if (proposal._status != ProposalStatus.Cancelled) {
            proposal._yesVotes = (proposal._yesVotes | _relayerBit(sender))
                .toUint200();
            proposal._yesVotesTotal++; // TODO: check if bit counting is cheaper.

            emit ProposalVote(
                domainID,
                depositNonce,
                proposal._status,
                dataHash
            );

            // Finalize if _relayerThreshold has been reached
            if (proposal._yesVotesTotal >= _relayerThreshold) {
                proposal._status = ProposalStatus.Passed;
                emit ProposalEvent(
                    domainID,
                    depositNonce,
                    ProposalStatus.Passed,
                    dataHash
                );
            }
        }
        _proposals[nonceAndID][dataHash] = proposal;

        if (proposal._status == ProposalStatus.Passed) {
            _executeProposal(domainID, depositNonce, data, resourceID, false);
        }
    }

    /**
        @notice Cancels a deposit proposal that has not been executed yet.
        @notice Only callable by relayers when Bridge is not paused.
        @param domainID ID of chain deposit originated from.
        @param depositNonce ID of deposited generated by origin Bridge contract.
        @param dataHash Hash of data originally provided when deposit was made.
        @notice Proposal must be past expiry threshold.
        @notice Emits {ProposalEvent} event with status {Cancelled}.
     */
    function cancelProposal(
        uint8 domainID,
        uint64 depositNonce,
        bytes32 dataHash
    ) public onlyAdminOrRelayer {
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(domainID);
        Proposal memory proposal = _proposals[nonceAndID][dataHash];
        ProposalStatus currentStatus = proposal._status;

        require(
            currentStatus == ProposalStatus.Active ||
                currentStatus == ProposalStatus.Passed,
            "Proposal cannot be cancelled"
        );
        require(
            uint40(sub(block.number, proposal._proposedBlock)) > _expiry,
            "Proposal not at expiry threshold"
        );

        proposal._status = ProposalStatus.Cancelled;
        _proposals[nonceAndID][dataHash] = proposal;

        emit ProposalEvent(
            domainID,
            depositNonce,
            ProposalStatus.Cancelled,
            dataHash
        );
    }

    /**
        @notice Executes a deposit proposal that is considered passed using a specified handler contract.
        @notice Only callable by relayers when Bridge is not paused.
        @param domainID ID of chain deposit originated from.
        @param resourceID ResourceID to be used when making deposits.
        @param depositNonce ID of deposited generated by origin Bridge contract.
        @param data Data originally provided when deposit was made.
        @param revertOnFail Decision if the transaction should be reverted in case of handler's executeProposal is reverted or not.
        @notice Proposal must have Passed status.
        @notice Hash of {data} must equal proposal's {dataHash}.
        @notice Emits {ProposalEvent} event with status {Executed}.
        @notice Emits {FailedExecution} event with the failed reason.
        @notice Behaviour of this function is different for {GenericHandler} and other specific ERC handlers.
        In the case of ERC handler, when execution fails, the handler will terminate the function with revert.
        In the case of {GenericHandler}, when execution fails, the handler will emit a failure event and terminate the function normally.
     */
    function executeProposal(
        uint8 domainID,
        uint64 depositNonce,
        bytes calldata data,
        bytes32 resourceID,
        bool revertOnFail
    ) public onlyRelayers whenNotPaused nonReentrant {
        _executeProposal(
            domainID,
            depositNonce,
            data,
            resourceID,
            revertOnFail
        );
    }

    function _executeProposal(
        uint8 domainID,
        uint64 depositNonce,
        bytes calldata data,
        bytes32 resourceID,
        bool revertOnFail
    ) private {
        address handler = _resourceIDToHandlerAddress[resourceID];
        uint72 nonceAndID = (uint72(depositNonce) << 8) | uint72(domainID);
        bytes32 dataHash = keccak256(
            abi.encodePacked(resourceID, handler, data)
        );
        Proposal storage proposal = _proposals[nonceAndID][dataHash];

        require(
            proposal._status == ProposalStatus.Passed,
            "Proposal must have Passed status"
        );

        proposal._status = ProposalStatus.Executed;
        IDepositExecute depositHandler = IDepositExecute(handler);

        if (revertOnFail) {
            depositHandler.executeProposal(resourceID, data);
        } else {
            try depositHandler.executeProposal(resourceID, data) {} catch (
                bytes memory lowLevelData
            ) {
                proposal._status = ProposalStatus.Passed;
                emit FailedHandlerExecution(lowLevelData);
                return;
            }
        }

        emit ProposalEvent(
            domainID,
            depositNonce,
            ProposalStatus.Executed,
            dataHash
        );
    }
}
