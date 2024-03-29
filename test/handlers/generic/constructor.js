/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../../helpers');

const BridgeContract = artifacts.require("Bridge");
const GenericHandlerContract = artifacts.require("GenericHandler");
const CentrifugeAssetContract = artifacts.require("CentrifugeAsset");
const WETH = artifacts.require("WETH9");

contract('GenericHandler - [constructor]', async () => {
    const relayerThreshold = 2;
    const domainID = 1;
    const centrifugeAssetMinCount = 1;
    const blankFunctionSig = '0x00000000';
    const blankFunctionDepositorOffset = 0;
    const centrifugeAssetStoreFuncSig = 'store(bytes32)';

    let BridgeInstance;
    let CentrifugeAssetInstance1;
    let CentrifugeAssetInstance2;
    let CentrifugeAssetInstance3;
    let initialResourceIDs;
    let initialContractAddresses;
    let initialDepositFunctionSignatures;
    let initialDepositFunctionDepositorOffsets;
    let initialExecuteFunctionSignatures;

    beforeEach(async () => {
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, domainID);
        await Promise.all([
            BridgeContract.new(domainID, [], relayerThreshold, 0, 100, ETHresourceID, weth.address).then(instance => BridgeInstance = instance),
            CentrifugeAssetContract.new(centrifugeAssetMinCount).then(instance => CentrifugeAssetInstance1 = instance),
            CentrifugeAssetContract.new(centrifugeAssetMinCount).then(instance => CentrifugeAssetInstance2 = instance),
            CentrifugeAssetContract.new(centrifugeAssetMinCount).then(instance => CentrifugeAssetInstance3 = instance)
        ]);

        initialResourceIDs = [
            Helpers.createResourceID(CentrifugeAssetInstance1.address, domainID),
            Helpers.createResourceID(CentrifugeAssetInstance2.address, domainID),
            Helpers.createResourceID(CentrifugeAssetInstance3.address, domainID)
        ];
        initialContractAddresses = [CentrifugeAssetInstance1.address, CentrifugeAssetInstance2.address, CentrifugeAssetInstance3.address];
        
        const executeProposalFuncSig = Ethers.utils.keccak256(Ethers.utils.hexlify(Ethers.utils.toUtf8Bytes(centrifugeAssetStoreFuncSig))).substr(0, 10);

        initialDepositFunctionSignatures = [blankFunctionSig, blankFunctionSig, blankFunctionSig];
        initialDepositFunctionDepositorOffsets = [blankFunctionDepositorOffset, blankFunctionDepositorOffset, blankFunctionDepositorOffset];
        initialExecuteFunctionSignatures = [executeProposalFuncSig, executeProposalFuncSig, executeProposalFuncSig];
    });

    it('[sanity] contract should be deployed successfully', async () => {
        TruffleAssert.passes(
            await GenericHandlerContract.new(
                BridgeInstance.address));
    });

    it('contract mappings were set with expected values', async () => {
        const GenericHandlerInstance = await GenericHandlerContract.new(
            BridgeInstance.address);

        for (let i = 0; i < initialResourceIDs.length; i++) {
            await BridgeInstance.adminSetGenericResource(GenericHandlerInstance.address, initialResourceIDs[i], initialContractAddresses[i], initialDepositFunctionSignatures[i], initialDepositFunctionDepositorOffsets[i], initialExecuteFunctionSignatures[i]);
        }
        
        for (let i = 0; i < initialResourceIDs.length; i++) {
            const retrievedTokenAddress = await GenericHandlerInstance._resourceIDToContractAddress.call(initialResourceIDs[i]);
            assert.strictEqual(initialContractAddresses[i].toLowerCase(), retrievedTokenAddress.toLowerCase());

            const retrievedResourceID = await GenericHandlerInstance._contractAddressToResourceID.call(initialContractAddresses[i]);
            assert.strictEqual(initialResourceIDs[i].toLowerCase(), retrievedResourceID.toLowerCase());

            const retrievedDepositFunctionSig = await GenericHandlerInstance._contractAddressToDepositFunctionSignature.call(initialContractAddresses[i]);
            assert.strictEqual(initialDepositFunctionSignatures[i].toLowerCase(), retrievedDepositFunctionSig.toLowerCase());

            const retrievedDepositFunctionDepositorOffset = await GenericHandlerInstance._contractAddressToDepositFunctionDepositorOffset.call(initialContractAddresses[i]);
            assert.strictEqual(initialDepositFunctionDepositorOffsets[i], retrievedDepositFunctionDepositorOffset.toNumber());

            const retrievedExecuteFunctionSig = await GenericHandlerInstance._contractAddressToExecuteFunctionSignature.call(initialContractAddresses[i]);
            assert.strictEqual(initialExecuteFunctionSignatures[i].toLowerCase(), retrievedExecuteFunctionSig.toLowerCase());
        }
    });
});
