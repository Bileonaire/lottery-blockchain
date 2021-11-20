const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () => {
    it('deployes a contact', () => {
        assert.ok(lottery.options.address);
    });

    it('allows one to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('require minimum ether', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: web3.utils.toWei('0.00001', 'ether')
            });
            assert(false);
        } catch (err) {
            assert(err);
            const players = await lottery.methods.getPlayers().call({
                from: accounts[0]
            });
            assert.equal(0, players.length);
        }
    });

    it('only manager pick winner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[4],
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('winner', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[1]);

        await lottery.methods.pickWinner().send({
            from: accounts[0],
        });

        const finalBalance = await web3.eth.getBalance(accounts[1]);
        const difference = finalBalance - initialBalance;
        assert(difference > web3.utils.toWei('1.7', 'ether'));

        //lottery reset
        const players = await lottery.methods.getPlayers().call({
                from: accounts[0]
            });
        assert.equal(0, players.length);

        // lottery has no money
        const LotteryBalance = await web3.eth.getBalance(lottery.options.address);
        assert.equal(0, LotteryBalance);
    });
});