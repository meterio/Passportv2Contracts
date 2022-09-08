/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');

const Helpers = require('../helpers');
const ethers = require('ethers');

const BridgeContract = artifacts.require("Bridge");
const ERC20HandlerContract = artifacts.require("ERC20Handler");
const WETH = artifacts.require("WETH9");
const { balance } = require('@openzeppelin/test-helpers');

contract('Bridge - [deposit - ETH]', async (accounts) => {
    const originDomainID = 1;
    const destinationDomainID = 2;
    const relayerThreshold = 0;
    const depositorAddress = accounts[1];
    const recipientAddress = accounts[2];
    let originChainInitialTokenAmount;
    let depositAmount;
    const expectedDepositNonce = 1;

    let BridgeInstance;
    let WethInstance;
    let OriginERC20HandlerInstance;
    let depositData;
    let ETHresourceID;

    beforeEach(async () => {
        originChainInitialTokenAmount = await balance.current(depositorAddress, unit = 'wei');
        depositAmount = ethers.utils.parseEther('10');
        WethInstance = await WETH.new();
        ETHresourceID = Helpers.createResourceID(WethInstance.address, originDomainID);
        BridgeInstance = await BridgeContract.new(originDomainID, [], relayerThreshold, 0, 100, ETHresourceID, WethInstance.address)

        OriginERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address);
        await BridgeInstance.adminSetResource(OriginERC20HandlerInstance.address, ETHresourceID, WethInstance.address)

        depositData = Helpers.createERCDepositData(
            depositAmount,
            20,
            recipientAddress);
    });


    it('ETH deposit can be made', async () => {
        await TruffleAssert.passes(BridgeInstance.depositETH(
            destinationDomainID,
            ETHresourceID,
            depositData,
            { from: depositorAddress, value: depositAmount }
        ));
    });

    it('_depositCounts should be increments from 0 to 1', async () => {
        await BridgeInstance.depositETH(
            destinationDomainID,
            ETHresourceID,
            depositData,
            { from: depositorAddress, value: depositAmount }
        );

        const depositCount = await BridgeInstance._depositCounts.call(destinationDomainID);
        assert.strictEqual(depositCount.toNumber(), expectedDepositNonce);
    });

    it('ETH can be deposited with correct balances', async () => {
        await BridgeInstance.depositETH(
            destinationDomainID,
            ETHresourceID,
            depositData,
            { from: depositorAddress, value: depositAmount }
        );

        const originChainHandlerBalance = await WethInstance.balanceOf(OriginERC20HandlerInstance.address);
        assert.strictEqual(originChainHandlerBalance.toString(), depositAmount.toString());
    });

    it('Deposit event is fired with expected value', async () => {
        let depositTx = await BridgeInstance.depositETH(
            destinationDomainID,
            ETHresourceID,
            depositData,
            { from: depositorAddress, value: depositAmount }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === destinationDomainID &&
                event.resourceID === ETHresourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce
        });

        depositTx = await BridgeInstance.depositETH(
            destinationDomainID,
            ETHresourceID,
            depositData,
            { from: depositorAddress, value: depositAmount }
        );

        TruffleAssert.eventEmitted(depositTx, 'Deposit', (event) => {
            return event.destinationDomainID.toNumber() === destinationDomainID &&
                event.resourceID === ETHresourceID.toLowerCase() &&
                event.depositNonce.toNumber() === expectedDepositNonce + 1
        });
    });

    it('deposit requires ETHresourceID that is mapped to a handler', async () => {
        await TruffleAssert.reverts(BridgeInstance.depositETH(destinationDomainID, '0x0', depositData, { from: depositorAddress, value: depositAmount }), "resourceID not WETH");
    });
});
