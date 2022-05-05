/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */
const { ethers, upgrades } = require("hardhat");
const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../helpers');

const CentrifugeAssetContract = artifacts.require("CentrifugeAsset");
const WETH = artifacts.require("WETH9");

// This test does NOT include all getter methods, just 
// getters that should work with only the constructor called
contract('Bridge - [admin]', async accounts => {
    const domainID = 1;
    const initialRelayers = accounts.slice(0, 3);
    
    const initialRelayerThreshold = 2;

    const expectedBridgeAdmin = accounts[0];
    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
    const bytes32 = Ethers.constants.HashZero;
    let ADMIN_ROLE;

    let BridgeInstance;

    let withdrawData = '';

    const assertOnlyAdmin = async(method, ...params) => {
        const otherRelayer = await ethers.getSigners();
        return TruffleAssert.reverts(BridgeInstance.connect(otherRelayer[2])[method](...params), "sender doesn't have admin role");
    };

    beforeEach(async () => {
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, domainID);
        BridgeInstance = await upgrades.deployProxy(await ethers.getContractFactory("BridgeUpgradeable"), [domainID, initialRelayers, initialRelayerThreshold, 0, 100, ETHresourceID, weth.address]);
        ADMIN_ROLE = await BridgeInstance.DEFAULT_ADMIN_ROLE()
    });

    // Testing pausable methods

    it('Bridge should not be paused', async () => {
        assert.isFalse(await BridgeInstance.paused());
    });

    it('Bridge should be paused', async () => {
        await TruffleAssert.passes(BridgeInstance.adminPauseTransfers());
        assert.isTrue(await BridgeInstance.paused());
    });

    it('Bridge should be unpaused after being paused', async () => {
        await TruffleAssert.passes(BridgeInstance.adminPauseTransfers());
        assert.isTrue(await BridgeInstance.paused());
        await TruffleAssert.passes(BridgeInstance.adminUnpauseTransfers());
        assert.isFalse(await BridgeInstance.paused());
    });

    // Testing relayer methods

    it('_relayerThreshold should be initialRelayerThreshold', async () => {
        assert.equal(await BridgeInstance._relayerThreshold(), initialRelayerThreshold);
    });

    it('_relayerThreshold should be initialRelayerThreshold', async () => {
        const newRelayerThreshold = 1;
        await TruffleAssert.passes(BridgeInstance.adminChangeRelayerThreshold(newRelayerThreshold));
        assert.equal(await BridgeInstance._relayerThreshold(), newRelayerThreshold);
    });

    it('newRelayer should be added as a relayer', async () => {
        const newRelayer = accounts[4];
        await TruffleAssert.passes(BridgeInstance.adminAddRelayer(newRelayer));
        assert.isTrue(await BridgeInstance.isRelayer(newRelayer));
    });

    it('newRelayer should be removed as a relayer after being added', async () => {
        const newRelayer = accounts[4];
        await TruffleAssert.passes(BridgeInstance.adminAddRelayer(newRelayer));
        assert.isTrue(await BridgeInstance.isRelayer(newRelayer))
        await TruffleAssert.passes(BridgeInstance.adminRemoveRelayer(newRelayer));
        assert.isFalse(await BridgeInstance.isRelayer(newRelayer));
    });

    it('existingRelayer should not be able to be added as a relayer', async () => {
        const existingRelayer = accounts[1];
        await TruffleAssert.reverts(BridgeInstance.adminAddRelayer(existingRelayer));
        assert.isTrue(await BridgeInstance.isRelayer(existingRelayer));
    });

    it('nonRelayerAddr should not be able to be added as a relayer', async () => {
        const nonRelayerAddr = accounts[4];
        await TruffleAssert.reverts(BridgeInstance.adminRemoveRelayer(nonRelayerAddr));
        assert.isFalse(await BridgeInstance.isRelayer(nonRelayerAddr));
    });

    // Testing ownership methods

    it('Bridge admin should be expectedBridgeAdmin', async () => {
        assert.isTrue(await BridgeInstance.hasRole(ADMIN_ROLE, expectedBridgeAdmin));
    });

    it('Bridge admin should be changed to expectedBridgeAdmin', async () => {
        const expectedBridgeAdmin2 = accounts[1];
        await TruffleAssert.passes(BridgeInstance.renounceAdmin(expectedBridgeAdmin2))
        assert.isTrue(await BridgeInstance.hasRole(ADMIN_ROLE, expectedBridgeAdmin2));
    });

    // Set Handler Address

    it('Should set a Resource ID for handler address', async () => {
        const ERC20MintableInstance = await upgrades.deployProxy(await ethers.getContractFactory("ERC20PresetMinterPauserUpgradeable"),["token", "TOK"]);
        const resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        const ERC20HandlerInstance = await upgrades.deployProxy(await ethers.getContractFactory("ERC20HandlerUpgradeable"),[BridgeInstance.address]);

        assert.equal(await BridgeInstance._resourceIDToHandlerAddress(resourceID), Ethers.constants.AddressZero);

        await TruffleAssert.passes(BridgeInstance.adminSetResource(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address));
        assert.equal(await BridgeInstance._resourceIDToHandlerAddress(resourceID), ERC20HandlerInstance.address);
    });

    // Set resource ID

    it('Should set a ERC20 Resource ID and contract address', async () => {
        const ERC20MintableInstance = await upgrades.deployProxy(await ethers.getContractFactory("ERC20PresetMinterPauserUpgradeable"),["token", "TOK"]);
        const resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        const ERC20HandlerInstance = await upgrades.deployProxy(await ethers.getContractFactory("ERC20HandlerUpgradeable"),[BridgeInstance.address]);

        await TruffleAssert.passes(BridgeInstance.adminSetResource(
            ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address));
        assert.equal(await ERC20HandlerInstance._resourceIDToTokenContractAddress(resourceID), ERC20MintableInstance.address);
        assert.equal(await ERC20HandlerInstance._tokenContractAddressToResourceID(ERC20MintableInstance.address), resourceID.toLowerCase());
    });

    it('Should require admin role to set a ERC20 Resource ID and contract address', async () => {
        await assertOnlyAdmin('adminSetResource', someAddress, bytes32, someAddress);
    });

    // Set Generic Resource

    it('Should set a Generic Resource ID and contract address', async () => {
        const CentrifugeAssetInstance = await CentrifugeAssetContract.new();
        const resourceID = Helpers.createResourceID(CentrifugeAssetInstance.address, domainID);
        const GenericHandlerInstance = await upgrades.deployProxy(await ethers.getContractFactory("GenericHandlerUpgradeable"),[BridgeInstance.address]);

        await TruffleAssert.passes(BridgeInstance.adminSetGenericResource(GenericHandlerInstance.address, resourceID, CentrifugeAssetInstance.address, '0x00000000', 0, '0x00000000'));
        assert.equal(await GenericHandlerInstance._resourceIDToContractAddress(resourceID), CentrifugeAssetInstance.address);
        assert.equal(await GenericHandlerInstance._contractAddressToResourceID(CentrifugeAssetInstance.address), resourceID.toLowerCase());
    });

    it('Should require admin role to set a Generic Resource ID and contract address', async () => {
        await assertOnlyAdmin('adminSetGenericResource', someAddress, bytes32, someAddress, '0x00000000', 0, '0x00000000');
    });

    // Set burnable

    it('Should set ERC20MintableInstance.address as burnable', async () => {
        const ERC20MintableInstance = await upgrades.deployProxy(await ethers.getContractFactory("ERC20PresetMinterPauserUpgradeable"),["token", "TOK"]);
        const resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        const ERC20HandlerInstance = await upgrades.deployProxy(await ethers.getContractFactory("ERC20HandlerUpgradeable"),[BridgeInstance.address]);

        await TruffleAssert.passes(BridgeInstance.adminSetResource(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address));
        await TruffleAssert.passes(BridgeInstance.adminSetBurnable(ERC20HandlerInstance.address, ERC20MintableInstance.address));
        assert.isTrue(await ERC20HandlerInstance._burnList(ERC20MintableInstance.address));
    });

    it('Should require admin role to set ERC20MintableInstance.address as burnable', async () => {
        await assertOnlyAdmin('adminSetBurnable', someAddress, someAddress);
    });

    // Set fee

    it('Should set fee', async () => {
        assert.equal(await BridgeInstance._fee(), 0);

        const fee = Ethers.utils.parseEther("0.05");
        await BridgeInstance.adminChangeFee(fee);
        const newFee = await BridgeInstance._fee();
        assert.equal(web3.utils.fromWei(newFee.toString(), "ether"), "0.05")
    });

    it('Should not set the same fee', async () => {
        await TruffleAssert.reverts(BridgeInstance.adminChangeFee(0), "Current fee is equal to new fee");
    });

    it('Should require admin role to set fee', async () => {
        await assertOnlyAdmin('adminChangeFee', 0);
    });

    // Withdraw

    it('Should withdraw funds', async () => {
        const numTokens = 10;
        const tokenOwner = accounts[0];

        let ownerBalance;
        let handlerBalance;

        const ERC20MintableInstance = await upgrades.deployProxy(await ethers.getContractFactory("ERC20PresetMinterPauserUpgradeable"),["token", "TOK"]);
        const resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
        const ERC20HandlerInstance = await upgrades.deployProxy(await ethers.getContractFactory("ERC20HandlerUpgradeable"),[BridgeInstance.address]);

        await TruffleAssert.passes(BridgeInstance.adminSetResource(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address));

        await ERC20MintableInstance.mint(tokenOwner, numTokens);
        ownerBalance = await ERC20MintableInstance.balanceOf(tokenOwner);
        assert.equal(ownerBalance, numTokens);

        await ERC20MintableInstance.transfer(ERC20HandlerInstance.address, numTokens);

        ownerBalance = await ERC20MintableInstance.balanceOf(tokenOwner);
        assert.equal(ownerBalance, 0);
        handlerBalance = await ERC20MintableInstance.balanceOf(ERC20HandlerInstance.address);
        assert.equal(handlerBalance, numTokens);

        withdrawData = Helpers.createERCWithdrawData(ERC20MintableInstance.address, tokenOwner, numTokens);

        await BridgeInstance.adminWithdraw(ERC20HandlerInstance.address, withdrawData);
        ownerBalance = await ERC20MintableInstance.balanceOf(tokenOwner);
        assert.equal(ownerBalance, numTokens);
    });

    it('Should require admin role to withdraw funds', async () => {
        await assertOnlyAdmin('adminWithdraw', someAddress, Ethers.constants.HashZero);
    });

    // Set nonce

    it('Should set nonce', async () => {
        const nonce = 3;
        await BridgeInstance.adminSetDepositNonce(domainID, nonce);
        const nonceAfterSet = await BridgeInstance._depositCounts(domainID);
        assert.equal(nonceAfterSet, nonce);
    });

    it('Should require admin role to set nonce', async () => {
        await assertOnlyAdmin('adminSetDepositNonce', 1, 3);
    });

    it('Should not allow for decrements of the nonce', async () => {
        const currentNonce = 3;
        await BridgeInstance.adminSetDepositNonce(domainID, currentNonce);
        const newNonce = 2;
        await TruffleAssert.reverts(BridgeInstance.adminSetDepositNonce(domainID, newNonce), "Does not allow decrements of the nonce");
    });
});
