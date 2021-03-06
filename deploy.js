const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
  'surprise siege now sketch ready bubble garbage chuckle salt entire increase little',
  'https://rinkeby.infura.io/v3/e36561f9e3064d9faf110a71fcfd5d6d'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });

  console.log(abi);
  console.log('Contract deployed to', result.options.address);
  provider.engine.stop();
};
deploy();
