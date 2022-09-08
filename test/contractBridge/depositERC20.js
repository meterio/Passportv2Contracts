/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');

const Helpers = require('../helpers');

const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");
const WETH = artifacts.require("WETH9");

contract('Bridge - [deposit - ERC20]', async (accounts) => {
    const originDomainID = 1;
    const destinationDomainID = 2;
    const relayerThreshold = 0;
    const depositorAddress = accounts[1];
    const recipientAddress = accounts[2];
    const originChainInitialTokenAmount = 100;
    const depositAmount = 10;
    const expectedDepositNonce = 1;
    
    let BridgeInstance;
    let OriginERC20MintableInstance;
    let OriginERC20HandlerInstance;
    let depositData;

    beforeEach(async () => {
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, originDomainID);
        await Promise.all([
            ERC20MintableContract.new("token", "TOK").then(instance => OriginERC20MintableInstance = instance),
            BridgeInstance = await BridgeContract.new(originDomainID, [], relayerThreshold, 0, 100, ETHresourceID, weth.address)
        ]);
        
        
        resourceID = Helpers.createResourceID(OriginERC20MintableInstance.address, originDomainID);

        OriginERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address);

        await Promise.all([
            BridgeInstance.adminSetResource(OriginERC20HandlerInstance.address, resourceID, OriginERC20MintableInstance.address),
            OriginERC20MintableInstance.mint(depositorAddress, originChainInitialTokenAmount)
        ]);
        await OriginERC20MintableInstance.approve(OriginERC20HandlerInstance.address, depositAmount * 2, { from: depositorAddress });

        depositData = Helpers.createERCDepositData(
            depositAmount,
            20,
            recipientAddress);
    });

    it("[sanity] test depositorAddress' balance", async () => {
        const originChainDepositorBalance = await OriginERC20MintableInstance.balanceOf(depositorAddress);
        assert.strictEqual(originChainDepositorBalance.toNumber(), originChainInitialTokenAmount);
    });

    it("[sanity] test OriginERC20HandlerInstance.address' allowance", async () => {
        const originChainHandlerAllowance = await OriginERC20MintableInstance.allowance(depositorAddress, OriginERC20HandlerInstance.address);
        assert.strictEqual(originChainHandlerAllowance.toNumber(), depositAmount * 2);
    });

    it('ERC20 deposit can be made', async () => {
        await TruffleAssert.passes(BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositorAddress }
        ));
    });

    it('_depositCounts should be increments from 0 to 1', async () => {
        await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositorAddress }
        );

        const depositCount = await BridgeInstance._depositCounts.call(destinationDomainID);
        assert.strictEqual(depositCount.toNumber(), expectedDepositNonce);
    });

    it('ERC20 can be deposited with correct balances', async () => {
        await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositorAddress }
        );

        const originChainDepositorBalance = await OriginERC20MintableInstance.balanceOf(depositorAddress);
        assert.strictEqual(originChainDepositorBalance.toNumber(), originChainInitialTokenAmount - depositAmount);

        const originChainHandlerBalance = await OriginERC20MintableInstance.balanceOf(OriginERC20HandlerInstance.address);
        assert.strictEqual(originChainHandlerBalance.toNumber(), depositAmount);
    });

    it('Deposit event is fired with expected value', async () => {
        let depositTx = await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositorAddress }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === destinationDomainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce
        });

        depositTx = await BridgeInstance.deposit(
            destinationDomainID,
            resourceID,
            depositData,
            { from: depositorAddress }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === destinationDomainID &&
                event.resourceID === resourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce + 1
        });
    });

    it('deposit requires resourceID that is mapped to a handler', async () => {
        await TruffleAssert.reverts(BridgeInstance.deposit(destinationDomainID, '0x0', depositData, { from: depositorAddress }), "resourceID not mapped to handler");
    });
});
