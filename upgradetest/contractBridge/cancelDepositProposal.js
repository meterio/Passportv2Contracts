/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */
const { ethers, upgrades } = require("hardhat");
const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../helpers');


const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");
const WETH = artifacts.require("WETH9");

contract('Bridge - [voteProposal with relayerThreshold == 3]', async (accounts) => {
    const originDomainID = 1;
    const destinationDomainID = 2;
    let relayer;
    const relayer1Bit = 1 << 0;
    const relayer2Bit = 1 << 1;
    const relayer3Bit = 1 << 2;
    const destinationChainRecipientAddress = accounts[4];
    const depositAmount = 10;
    const expectedDepositNonce = 1;
    const relayerThreshold = 3;

    let BridgeInstance;
    let DestinationERC20MintableInstance;
    let DestinationERC20HandlerInstance;
    let depositData = '';
    let depositDataHash = '';
    let resourceID = '';

    let vote, executeProposal;

    beforeEach(async () => {
        relayer = await ethers.getSigners();
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, destinationDomainID);
        await Promise.all([
            await upgrades.deployProxy(await ethers.getContractFactory("BridgeUpgradeable"), [destinationDomainID, [
                relayer[1].address,
                relayer[2].address,
                relayer[3].address,
                relayer[4].address],
                relayerThreshold,
                0,
                10, ETHresourceID, weth.address]).then(instance => BridgeInstance = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => DestinationERC20MintableInstance = instance)
        ]);

        resourceID = Helpers.createResourceID(DestinationERC20MintableInstance.address, originDomainID);

        DestinationERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address);
        await TruffleAssert.passes(BridgeInstance.adminSetResource(DestinationERC20HandlerInstance.address, resourceID, DestinationERC20MintableInstance.address));
        await TruffleAssert.passes(BridgeInstance.adminSetBurnable(DestinationERC20HandlerInstance.address, DestinationERC20MintableInstance.address));

        depositData = Helpers.createERCDepositData(depositAmount, 20, destinationChainRecipientAddress);
        depositDataHash = Ethers.utils.keccak256(DestinationERC20HandlerInstance.address + depositData.substr(2));

        await Promise.all([
            DestinationERC20MintableInstance.grantRole(await DestinationERC20MintableInstance.MINTER_ROLE(), DestinationERC20HandlerInstance.address),
            BridgeInstance.adminSetResource(DestinationERC20HandlerInstance.address, resourceID, DestinationERC20MintableInstance.address)
        ]);

        vote = (relayer) => BridgeInstance.connect(relayer).voteProposal(originDomainID, expectedDepositNonce, resourceID, depositData);
        executeProposal = (relayer) => BridgeInstance.connect(relayer).executeProposal(originDomainID, expectedDepositNonce, depositData);
    });

    it('[sanity] bridge configured with threshold, relayers, and expiry', async () => {
        assert.equal(await BridgeInstance._domainID(), destinationDomainID)

        assert.equal(await BridgeInstance._relayerThreshold(), relayerThreshold)

        assert.equal((await BridgeInstance._totalRelayers()).toString(), '4')

        assert.equal(await BridgeInstance._expiry(), 10)
    })

    it('[sanity] depositProposal should be created with expected values', async () => {
        await TruffleAssert.passes(vote(relayer[1]));

        const expectedDepositProposal = {
            _yesVotes: Ethers.BigNumber.from(relayer1Bit.toString()),
            _yesVotesTotal: 1,
            _status: 1 // Active
        };

        const depositProposal = await BridgeInstance.getProposal(
            originDomainID, expectedDepositNonce, depositDataHash);
        assert.deepInclude(Object.assign({}, depositProposal), expectedDepositProposal);
    });


    it("voting on depositProposal after threshold results in cancelled proposal", async () => {
        await TruffleAssert.passes(vote(relayer[1]));

        for (i = 0; i < 10; i++) {
            await Helpers.advanceBlock();
        }

        await TruffleAssert.passes(vote(relayer[2]));

        const expectedDepositProposal = {
            _yesVotes: Ethers.BigNumber.from(relayer1Bit.toString()),
            _yesVotesTotal: 1,
            _status: 4 // Cancelled
        };
        const depositProposal = await BridgeInstance.getProposal(originDomainID, expectedDepositNonce, depositDataHash);
        assert.deepInclude(Object.assign({}, depositProposal), expectedDepositProposal);
        await TruffleAssert.reverts(vote(relayer[3]), "proposal already executed/cancelled")
    });


    it("relayer can cancel proposal after threshold blocks have passed", async () => {
        await TruffleAssert.passes(vote(relayer[2]));

        for (i = 0; i < 10; i++) {
            await Helpers.advanceBlock();
        }

        const expectedDepositProposal = {
            _yesVotes: Ethers.BigNumber.from(relayer2Bit.toString()),
            _yesVotesTotal: 1,
            _status: 4 // Cancelled
        };

        await TruffleAssert.passes(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash))
        const depositProposal = await BridgeInstance.getProposal(originDomainID, expectedDepositNonce, depositDataHash);
        assert.deepInclude(Object.assign({}, depositProposal), expectedDepositProposal);
        await TruffleAssert.reverts(vote(relayer[4]), "proposal already executed/cancelled")
    });

    it("relayer cannot cancel proposal before threshold blocks have passed", async () => {
        await TruffleAssert.passes(vote(relayer[2]));

        await TruffleAssert.reverts(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash), "Proposal not at expiry threshold")
    });

    it("admin can cancel proposal after threshold blocks have passed", async () => {
        await TruffleAssert.passes(vote(relayer[3]));

        for (i = 0; i < 10; i++) {
            await Helpers.advanceBlock();
        }

        const expectedDepositProposal = {
            _yesVotes: Ethers.BigNumber.from(relayer3Bit.toString()),
            _yesVotesTotal: 1,
            _status: 4 // Cancelled
        };

        await TruffleAssert.passes(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash))
        const depositProposal = await BridgeInstance.getProposal(originDomainID, expectedDepositNonce, depositDataHash);
        assert.deepInclude(Object.assign({}, depositProposal), expectedDepositProposal);
        await TruffleAssert.reverts(vote(relayer[2]), "proposal already executed/cancelled")
    });

    it("proposal cannot be cancelled twice", async () => {
        await TruffleAssert.passes(vote(relayer[3]));

        for (i = 0; i < 10; i++) {
            await Helpers.advanceBlock();
        }

        await TruffleAssert.passes(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash))
        await TruffleAssert.reverts(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash), "Proposal cannot be cancelled")
    });

    it("inactive proposal cannot be cancelled", async () => {
        await TruffleAssert.reverts(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash), "Proposal cannot be cancelled")
    });

    it("executed proposal cannot be cancelled", async () => {
        await TruffleAssert.passes(vote(relayer[1]));
        await TruffleAssert.passes(vote(relayer[2]));
        await TruffleAssert.passes(vote(relayer[3])); // After this vote, automatically executes the proposal.

        await TruffleAssert.reverts(BridgeInstance.cancelProposal(originDomainID, expectedDepositNonce, depositDataHash), "Proposal cannot be cancelled")
    });

});
