/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */const { ethers, upgrades } = require("hardhat");
const TruffleAssert = require('truffle-assertions');


const WETH = artifacts.require("WETH9");
const Helpers = require('../helpers');

contract('Bridge - [constructor]', async accounts => {
    const domainID = 1;
    const initialRelayers = accounts.slice(0, 3);
    const initialRelayerThreshold = 2;

    const expectedBridgeAdmin = accounts[0];
    const someAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
    const bytes32 = Ethers.constants.HashZero;

    const BN = (num) => {
        return web3.utils.toBN(num);
    };

    let weth, ETHresourceID;

    beforeEach(async () => {
        weth = await WETH.new();
        ETHresourceID = Helpers.createResourceID(weth.address, domainID);
    });

    it('Bridge should not allow to set initialRelayerThreshold above 255', async () => {
        return TruffleAssert.fails(await upgrades.deployProxy(await ethers.getContractFactory("BridgeUpgradeable"), domainID, initialRelayers, 256, 0, 100, ETHresourceID, weth.address), "value does not fit in 8 bits");
    });

    it('Bridge should not allow to set fee above 2**128 - 1', async () => {
        return TruffleAssert.fails(await upgrades.deployProxy(await ethers.getContractFactory("BridgeUpgradeable"), 
            domainID, initialRelayers, initialRelayerThreshold, BN(2).pow(BN(128)), 100, ETHresourceID, weth.address), "value does not fit in 128 bits");
    });

    it('Bridge should not allow to set expiry above 2**40 - 1', async () => {
        return TruffleAssert.fails(await upgrades.deployProxy(await ethers.getContractFactory("BridgeUpgradeable"), domainID, initialRelayers, initialRelayerThreshold, 0, BN(2).pow(BN(40)), ETHresourceID, weth.address), "value does not fit in 40 bits");
    });
});
