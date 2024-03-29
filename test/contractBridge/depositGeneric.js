/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');

const Helpers = require('../helpers');

const BridgeContract = artifacts.require("Bridge");
const CentrifugeAssetContract = artifacts.require("CentrifugeAsset");
const GenericHandlerContract = artifacts.require("GenericHandler");
const WETH = artifacts.require("WETH9");

contract('Bridge - [deposit - Generic]', async () => {
    const originDomainID = 1;
    const destinationDomainID = 2;
    const expectedDepositNonce = 1;
    
    let BridgeInstance;
    let GenericHandlerInstance;
    let depositData;
    let initialResourceIDs;
    let initialContractAddresses;
    let initialDepositFunctionSignatures;
    let initialDepositFunctionDepositorOffsets;
    let initialExecuteFunctionSignatures;

    beforeEach(async () => {
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, originDomainID);
        await Promise.all([
            CentrifugeAssetContract.new().then(instance => CentrifugeAssetInstance = instance),
            BridgeInstance = BridgeContract.new(originDomainID, [], 0, 0, 100, ETHresourceID, weth.address).then(instance => BridgeInstance = instance)
        ]);
        
        resourceID = Helpers.createResourceID(CentrifugeAssetInstance.address, originDomainID)
        initialResourceIDs = [resourceID];
        initialContractAddresses = [CentrifugeAssetInstance.address];
        initialDepositFunctionSignatures = [Helpers.blankFunctionSig];
        initialDepositFunctionDepositorOffsets = [Helpers.blankFunctionDepositorOffset];
        initialExecuteFunctionSignatures = [Helpers.getFunctionSignature(CentrifugeAssetInstance, 'store')];

        GenericHandlerInstance = await GenericHandlerContract.new(
            BridgeInstance.address);
            
        await BridgeInstance.adminSetGenericResource(GenericHandlerInstance.address, resourceID,  initialContractAddresses[0], initialDepositFunctionSignatures[0], initialDepositFunctionDepositorOffsets[0], initialExecuteFunctionSignatures[0]);

        depositData = Helpers.createGenericDepositData('0xdeadbeef');
    });

    it('Generic deposit can be made', async () => {
        await TruffleAssert.passes(BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData
        ));
    });

    it('_depositCounts is incremented correctly after deposit', async () => {
        await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData
        );

        const depositCount = await BridgeInstance._depositCounts.call(destinationDomainID);
        assert.strictEqual(depositCount.toNumber(), expectedDepositNonce);
    });

    it('Deposit event is fired with expected value after Generic deposit', async () => {
        const depositTx = await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === destinationDomainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce
        });
    });
});