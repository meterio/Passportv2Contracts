const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../../helpers');

const BridgeContract = artifacts.require("Bridge");
const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const ERC20HandlerContract = artifacts.require("ERC20Handler");
const WETH = artifacts.require("WETH9");

contract('E2E ERC20 - Same Chain', async accounts => {
    const relayerThreshold = 2;
    const domainID = 1;

    const depositorAddress = accounts[1];
    const recipientAddress = accounts[2];
    const relayer1Address = accounts[3];
    const relayer2Address = accounts[4];

    const initialTokenAmount = 100;
    const depositAmount = 10;
    const expectedDepositNonce = 1;

    let BridgeInstance;
    let ERC20MintableInstance;
    let ERC20HandlerInstance;

    let resourceID;
    let depositData;
    let depositProposalData;
    let depositProposalDataHash;
    let initialResourceIDs;
    let initialContractAddresses;
    let burnableContractAddresses;

    beforeEach(async () => {
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, domainID);
        await Promise.all([
            BridgeContract.new(domainID, [relayer1Address, relayer2Address], relayerThreshold, 0, 100, ETHresourceID, weth.address).then(instance => BridgeInstance = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => ERC20MintableInstance = instance)
        ]);
        
        resourceID = Helpers.createResourceID(ERC20MintableInstance.address, domainID);
    
        initialResourceIDs = [resourceID];
        initialContractAddresses = [ERC20MintableInstance.address];
        burnableContractAddresses = [];

        ERC20HandlerInstance = await ERC20HandlerContract.new(BridgeInstance.address);

        await Promise.all([
            ERC20MintableInstance.mint(depositorAddress, initialTokenAmount),
            BridgeInstance.adminSetResource(ERC20HandlerInstance.address, resourceID, ERC20MintableInstance.address)
        ]);
        
        await ERC20MintableInstance.approve(ERC20HandlerInstance.address, depositAmount, { from: depositorAddress });

        depositData = Helpers.createERCDepositData(depositAmount, 20, recipientAddress)
        depositProposalData = Helpers.createERCDepositData(depositAmount, 20, recipientAddress)
        depositProposalDataHash = Ethers.utils.keccak256(ERC20HandlerInstance.address + depositProposalData.substr(2));
    });

    it("[sanity] depositorAddress' balance should be equal to initialTokenAmount", async () => {
        const depositorBalance = await ERC20MintableInstance.balanceOf(depositorAddress);
        assert.strictEqual(depositorBalance.toNumber(), initialTokenAmount);
    });

    it("[sanity] ERC20HandlerInstance.address should have an allowance of depositAmount from depositorAddress", async () => {
        const handlerAllowance = await ERC20MintableInstance.allowance(depositorAddress, ERC20HandlerInstance.address);
        assert.strictEqual(handlerAllowance.toNumber(), depositAmount);
    });

    it("depositAmount of Destination ERC20 should be transferred to recipientAddress", async () => {
        // depositorAddress makes initial deposit of depositAmount
        await TruffleAssert.passes(BridgeInstance.deposit(
            domainID,
            resourceID,
            depositData,
            { from: depositorAddress }
        ));

        // Handler should have a balance of depositAmount
        const handlerBalance = await ERC20MintableInstance.balanceOf(ERC20HandlerInstance.address);
        assert.strictEqual(handlerBalance.toNumber(), depositAmount);

        // relayer1 creates the deposit proposal
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer1Address }
        ));

        // relayer2 votes in favor of the deposit proposal
        // because the relayerThreshold is 2, the deposit proposal will go
        // into a finalized state
        // and then automatically executes the proposal
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            expectedDepositNonce,
            resourceID,
            depositProposalData,
            { from: relayer2Address }
        ));

        // Assert ERC20 balance was transferred from depositorAddress
        const depositorBalance = await ERC20MintableInstance.balanceOf(depositorAddress);
        assert.strictEqual(depositorBalance.toNumber(), initialTokenAmount - depositAmount);

        // // Assert ERC20 balance was transferred to recipientAddress
        const recipientBalance = await ERC20MintableInstance.balanceOf(recipientAddress);
        assert.strictEqual(recipientBalance.toNumber(), depositAmount);
    });
});
