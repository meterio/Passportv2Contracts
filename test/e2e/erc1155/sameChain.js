const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../../helpers');

const BridgeContract = artifacts.require("Bridge");
const ERC1155MintableContract = artifacts.require("ERC1155PresetMinterPauser");
const ERC1155HandlerContract = artifacts.require("ERC1155Handler");
const WETH = artifacts.require("WETH9");

contract('E2E ERC1155 - Same Chain', async accounts => {
    const relayerThreshold = 2;
    const domainID = 1;

    const depositorAddress = accounts[1];
    const recipientAddress = accounts[2];
    const relayer1Address = accounts[3];
    const relayer2Address = accounts[4];

    const tokenID = 1;
    const initialTokenAmount = 100;
    const depositAmount = 10;
    const expectedDepositNonce = 1;

    let BridgeInstance;
    let ERC1155MintableInstance;
    let ERC1155HandlerInstance;
    let initialResourceIDs;
    let initialContractAddresses;
    let burnableContractAddresses;

    let resourceID;
    let depositData;
    let proposalData;

    beforeEach(async () => {
        const weth = await WETH.new();
        const ETHresourceID = Helpers.createResourceID(weth.address, domainID);
        await Promise.all([
            BridgeContract.new(domainID, [relayer1Address, relayer2Address], relayerThreshold, 0, 100, ETHresourceID, weth.address).then(instance => BridgeInstance = instance),
            ERC1155MintableContract.new("TOK").then(instance => ERC1155MintableInstance = instance)
        ]);

        resourceID = Helpers.createResourceID(ERC1155MintableInstance.address, domainID);
        initialResourceIDs = [resourceID];
        initialContractAddresses = [ERC1155MintableInstance.address];
        burnableContractAddresses = [];

        ERC1155HandlerInstance = await ERC1155HandlerContract.new(BridgeInstance.address);

        await Promise.all([
            ERC1155MintableInstance.mintBatch(depositorAddress, [tokenID], [initialTokenAmount], "0x0"),
            BridgeInstance.adminSetResource(ERC1155HandlerInstance.address, resourceID, ERC1155MintableInstance.address)
        ]);

        await ERC1155MintableInstance.setApprovalForAll(ERC1155HandlerInstance.address, true, { from: depositorAddress });

        depositData = Helpers.createERC1155DepositData([tokenID], [depositAmount]);
        proposalData = Helpers.createERC1155DepositProposalData([tokenID], [depositAmount], recipientAddress, "0x");
    });

    it("[sanity] depositorAddress' balance should be equal to initialTokenAmount", async () => {
        const depositorBalance = await ERC1155MintableInstance.balanceOf(depositorAddress, tokenID);
        assert.strictEqual(depositorBalance.toNumber(), initialTokenAmount);
    });

    it("depositAmount of Destination ERC1155 should be transferred to recipientAddress", async () => {
        // depositorAddress makes initial deposit of depositAmount
        await TruffleAssert.passes(BridgeInstance.deposit(
            domainID,
            resourceID,
            depositData,
            { from: depositorAddress }
        ));

        // Handler should have a balance of depositAmount
        const handlerBalance = await ERC1155MintableInstance.balanceOf(ERC1155HandlerInstance.address, tokenID);
        assert.strictEqual(handlerBalance.toNumber(), depositAmount);

        // relayer1 creates the deposit proposal
        await TruffleAssert.passes(BridgeInstance.voteProposal(
            domainID,
            expectedDepositNonce,
            resourceID,
            proposalData,
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
            proposalData,
            { from: relayer2Address }
        ));

        // Assert ERC1155 balance was transferred from depositorAddress
        const depositorBalance = await ERC1155MintableInstance.balanceOf(depositorAddress, tokenID);
        assert.strictEqual(depositorBalance.toNumber(), initialTokenAmount - depositAmount);

        // Assert ERC1155 balance was transferred to recipientAddress
        const recipientBalance = await ERC1155MintableInstance.balanceOf(recipientAddress, tokenID);
        assert.strictEqual(recipientBalance.toNumber(), depositAmount);
    });

    it("Handler's deposit function can be called by only bridge", async () => {
        await TruffleAssert.reverts(ERC1155HandlerInstance.deposit(resourceID, depositorAddress, depositData, { from: depositorAddress }), "sender must be bridge contract");
    });

    it("Handler's executeProposal function can be called by only bridge", async () => {
        await TruffleAssert.reverts(ERC1155HandlerInstance.executeProposal(resourceID, proposalData, { from: depositorAddress }), "sender must be bridge contract");
    });

    it("Handler's withdraw function can be called by only bridge", async () => {
        let withdrawData;
        withdrawData = Helpers.createERC1155WithdrawData(ERC1155MintableInstance.address, depositorAddress, [tokenID], [depositAmount], "0x");

        await TruffleAssert.reverts(ERC1155HandlerInstance.withdraw(withdrawData, { from: depositorAddress }), "sender must be bridge contract");
    });

    it("Should withdraw funds", async () => {
        let depositorBalance;
        let handlerBalance;
        let withdrawData;

        depositorBalance = await ERC1155MintableInstance.balanceOf(depositorAddress, tokenID);
        assert.equal(depositorBalance, initialTokenAmount);

        await ERC1155MintableInstance.safeTransferFrom(depositorAddress, ERC1155HandlerInstance.address, tokenID, depositAmount, "0x0", { from: depositorAddress });

        depositorBalance = await ERC1155MintableInstance.balanceOf(depositorAddress, tokenID);
        assert.equal(depositorBalance.toNumber(), initialTokenAmount - depositAmount);

        handlerBalance = await ERC1155MintableInstance.balanceOf(ERC1155HandlerInstance.address, tokenID);
        assert.equal(handlerBalance, depositAmount);

        withdrawData = Helpers.createERC1155WithdrawData(ERC1155MintableInstance.address, depositorAddress, [tokenID], [depositAmount], "0x");

        await BridgeInstance.adminWithdraw(ERC1155HandlerInstance.address, withdrawData);

        depositorBalance = await ERC1155MintableInstance.balanceOf(depositorAddress, tokenID);
        assert.equal(depositorBalance, initialTokenAmount);
    });
});
