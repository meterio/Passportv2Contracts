/**
 * Copyright 2021 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');
const Wallet = require('ethereumjs-wallet').default;
const ethSigUtil = require('eth-sig-util');

const Helpers = require('../helpers');

const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");
const WETH = artifacts.require("WETH9");

contract('Bridge - [voteProposals]', async (accounts) => {
    const originDomainID = 1;
    const destinationDomainID = 2;
    const relayer1 = Wallet.generate();
    const relayer2 = Wallet.generate();
    const relayer3 = Wallet.generate();
    const relayer4 = Wallet.generate();
    const relayer1Address = relayer1.getAddressString();
    const relayer2Address = relayer2.getAddressString();
    const relayer3Address = relayer3.getAddressString();
    const relayer4Address = relayer4.getAddressString();
    const depositer = Wallet.generate();
    const depositerAddress = depositer.getAddressString();
    const destinationChainRecipientAddress = accounts[4];
    const depositAmount = 10;
    const expectedDepositNonce = 1;
    const relayerThreshold = 3;
    const expectedFinalizedEventStatus = 2;

    const STATUS = {
        Inactive: '0',
        Active: '1',
        Passed: '2',
        Executed: '3',
        Cancelled: '4'
    }

    const name = 'PermitBridge';
    const version = '1.0';

    const EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
    ];

    let domain;
    const types = {
        EIP712Domain,
        PermitBridge: [
            { name: 'domainID', type: 'uint8' },
            { name: 'depositNonce', type: 'uint64' },
            { name: 'resourceID', type: 'bytes32' },
            { name: 'data', type: 'bytes' },
        ],
    }

    let BridgeInstance;
    let DestinationERC20MintableInstance;
    let DestinationERC20HandlerInstance;
    let depositData = '';
    let depositDataHash = '';
    let resourceID = '';
    let initialContractAddresses;
    let burnableContractAddresses;

    let voteCallData, executeCallData;

    beforeEach(async () => {
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, destinationDomainID);
        await Promise.all([
            BridgeContract.new(destinationDomainID, [
                relayer1Address,
                relayer2Address,
                relayer3Address,
                relayer4Address],
                relayerThreshold,
                0,
                100, ETHresourceID, weth.address).then(instance => BridgeInstance = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => DestinationERC20MintableInstance = instance)
        ]);

        resourceID = Helpers.createResourceID(DestinationERC20MintableInstance.address, originDomainID);
        initialResourceIDs = [resourceID];
        initialContractAddresses = [DestinationERC20MintableInstance.address];
        burnableContractAddresses = [DestinationERC20MintableInstance.address];

        DestinationERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address);

        await TruffleAssert.passes(BridgeInstance.adminSetResource(DestinationERC20HandlerInstance.address, resourceID, initialContractAddresses[0]));
        await TruffleAssert.passes(BridgeInstance.adminSetBurnable(DestinationERC20HandlerInstance.address, burnableContractAddresses[0]));

        depositData = Helpers.createERCDepositData(depositAmount, 20, destinationChainRecipientAddress);
        depositDataHash = Ethers.utils.keccak256(DestinationERC20HandlerInstance.address + depositData.substr(2));

        await Promise.all([
            DestinationERC20MintableInstance.grantRole(await DestinationERC20MintableInstance.MINTER_ROLE(), DestinationERC20HandlerInstance.address),
            BridgeInstance.adminSetResource(DestinationERC20HandlerInstance.address, resourceID, DestinationERC20MintableInstance.address)
        ]);

        voteCallData = Helpers.createCallData(BridgeInstance, 'voteProposal', ["uint8", "uint64", "bytes32", "bytes"], [originDomainID, expectedDepositNonce, resourceID, depositData]);
        executeCallData = Helpers.createCallData(BridgeInstance, 'executeProposal', ["uint8", "uint64", "bytes", "bytes32", "bool"], [originDomainID, expectedDepositNonce, depositData, resourceID, true]);

        const provider = new Ethers.providers.JsonRpcProvider();
        const signer = provider.getSigner();

        await signer.sendTransaction({ to: relayer1Address, value: Ethers.utils.parseEther("0.1") });
        await signer.sendTransaction({ to: relayer2Address, value: Ethers.utils.parseEther("0.1") });
        await signer.sendTransaction({ to: relayer3Address, value: Ethers.utils.parseEther("0.1") });
        await signer.sendTransaction({ to: relayer4Address, value: Ethers.utils.parseEther("0.1") });
        await signer.sendTransaction({ to: depositerAddress, value: Ethers.utils.parseEther("0.1") });
        let chainId = await BridgeInstance._chainId();
        domain = {
            name,
            version,
            chainId: parseInt(chainId.toString()),
            verifyingContract: BridgeInstance.address,
        };
    });

    it('[sanity] bridge configured with threshold and relayers', async () => {
        assert.equal(await BridgeInstance._domainID(), destinationDomainID)

        assert.equal(await BridgeInstance._relayerThreshold(), relayerThreshold)

        assert.equal((await BridgeInstance._totalRelayers()).toString(), '4')
    })

    it("depositProposal should be automatically executed after the vote if proposal status is changed to Passed during the vote", async () => {
        const request = {
            domainID: destinationDomainID,
            depositNonce: expectedDepositNonce,
            resourceID: resourceID,
            data: depositData,
        }

        let sign1 = ethSigUtil.signTypedMessage(
            relayer1.getPrivateKey(),
            {
                data: {
                    types: types,
                    domain: domain,
                    primaryType: 'PermitBridge',
                    message: request
                }
            }
        )

        let sign2 = ethSigUtil.signTypedMessage(
            relayer2.getPrivateKey(),
            {
                data: {
                    types: types,
                    domain: domain,
                    primaryType: 'PermitBridge',
                    message: request
                }
            }
        )
        let sign3 = ethSigUtil.signTypedMessage(
            relayer3.getPrivateKey(),
            {
                data: {
                    types: types,
                    domain: domain,
                    primaryType: 'PermitBridge',
                    message: request
                }
            }
        )
        await BridgeInstance.voteProposals(destinationDomainID, expectedDepositNonce, resourceID, depositData, [sign1, sign2, sign3]);

        const depositProposalAfterThirdVoteWithExecute = await BridgeInstance.getProposal(
            destinationDomainID, expectedDepositNonce, depositDataHash);

        assert.strictEqual(depositProposalAfterThirdVoteWithExecute._status, STATUS.Executed); // Executed
    });
});
