/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */
const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../../helpers');

const BridgeContract = artifacts.require("Bridge");
const ERC721MintableContract = artifacts.require("ERC721MinterBurnerPauser");
const ERC721HandlerContract = artifacts.require("ERC721Handler");
const WETH = artifacts.require("WETH9");

contract('ERC721Handler - [Deposit ERC721]', async (accounts) => {
    const relayerThreshold = 2;
    const domainID = 1;
    const expectedDepositNonce = 1;
    const depositorAddress = accounts[1];
    const tokenID = 1;

    let BridgeInstance;
    let ERC721MintableInstance;
    let ERC721HandlerInstance;

    let resourceID;
    let initialResourceIDs;
    let initialContractAddresses;
    let burnableContractAddresses;

    beforeEach(async () => {
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, domainID);
        await Promise.all([
            BridgeContract.new(domainID, [], relayerThreshold, 0, 100, ETHresourceID, weth.address).then(instance => BridgeInstance = instance),
            ERC721MintableContract.new("token", "TOK", "").then(instance => ERC721MintableInstance = instance)
        ])
        
        resourceID = Helpers.createResourceID(ERC721MintableInstance.address, domainID);
        initialResourceIDs = [resourceID];
        initialContractAddresses = [ERC721MintableInstance.address];
        burnableContractAddresses = []

        await Promise.all([
            ERC721HandlerContract.new(BridgeInstance.address).then(instance => ERC721HandlerInstance = instance),
            ERC721MintableInstance.mint(depositorAddress, tokenID, "")
        ]);

        await Promise.all([
            ERC721MintableInstance.approve(ERC721HandlerInstance.address, tokenID, { from: depositorAddress }),
            BridgeInstance.adminSetResource(ERC721HandlerInstance.address, resourceID, ERC721MintableInstance.address)
        ]);
    });

    it('[sanity] depositor owns ERC721 with tokenID', async () => {
        const tokenOwner = await ERC721MintableInstance.ownerOf(tokenID);
        assert.equal(depositorAddress, tokenOwner);
    });

    it('[sanity] ERC721HandlerInstance.address has an allowance for tokenID', async () => {
        const tokenAllowee = await ERC721MintableInstance.getApproved(tokenID);
        assert.equal(ERC721HandlerInstance.address, tokenAllowee);
    });

    it('Varied recipient address with length 40', async () => {
        const recipientAddress = accounts[0] + accounts[1].substr(2);
        const lenRecipientAddress = 40;
        
        const depositTx = await BridgeInstance.deposit(
            domainID,
            resourceID,
            Helpers.createERCDepositData(
                tokenID,
                lenRecipientAddress,
                recipientAddress),
            { from: depositorAddress }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === domainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce &&
                event.user === depositorAddress &&
                event.data === Helpers.createERCDepositData(
                    tokenID,
                    lenRecipientAddress,
                    recipientAddress).toLowerCase() &&
                event.handlerResponse === null
        });
    });

    it('Varied recipient address with length 32', async () => {
        const recipientAddress = Ethers.utils.keccak256(accounts[0]);
        const lenRecipientAddress = 32;

        const depositTx = await BridgeInstance.deposit(
            domainID,
            resourceID,
            Helpers.createERCDepositData(
                tokenID,
                lenRecipientAddress,
                recipientAddress),
            { from: depositorAddress }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === domainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce &&
                event.user === depositorAddress &&
                event.data === Helpers.createERCDepositData(
                    tokenID,
                    lenRecipientAddress,
                    recipientAddress).toLowerCase() &&
                event.handlerResponse === null
        });
    });
});
