const BN = require('bn.js');
const Web3 = require('web3');
const { 
    WALLET_PUBLIC_KEY, 
    WALLET_PRIVATE_KEY, 
    INFURA_PROJECT_ID,
    DEST_TOKEN_ADDRESS,
    CONTRACT_ADDRESS,
    ETH_ADDRESS
} = require('./config/config');

const Tx = require('ethereumjs-tx').Transaction;

// Connecting to rinkeby infura node
const web3 = new Web3(`https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`);

process.on('unhandledRejection', function(reason, p) {
    console.error(reason.stack);
});

// Trade Details
const SRC_DECIMALS = 18;
const SRC_QTY = "1"; //1 Ether
const SRC_QTY_WEI = (SRC_QTY * 10 ** SRC_DECIMALS).toString();

web3.eth.accounts.wallet.add(WALLET_PRIVATE_KEY);

// Destination Token Instance - DAI
const DAI_ABI = require('./config/ABI/DaiABI.json');
const DAI = new web3.eth.Contract(DAI_ABI, DEST_TOKEN_ADDRESS);

// Smart Contract Instance - Contract deployed to Rinkeby TestNet
const ContractABI = require('./config/ABI/ContractExample.json');
const ContractInstance = new web3.eth.Contract(ContractABI, CONTRACT_ADDRESS);


// Function to broadcast transaction
async function sendTx(txObject, txTo, gasPrice) {
    try {
        const nonce = await web3.eth.getTransactionCount(WALLET_PUBLIC_KEY);
        const gas = 500 * 1000;
        
    
        const txData = txObject.encodeABI();
        const txFrom = WALLET_PUBLIC_KEY;
    
        const txParams = {
            from: txFrom,
            to: txTo,
            data: txData,
            value: web3.utils.toHex(SRC_QTY_WEI), //Ether value to be included in the tx
            gas,
            nonce,
            chainId: await web3.eth.net.getId(),
            gasPrice: web3.utils.toHex(gasPrice),
        };
    
        var tx = new Tx(txParams, { 'chain': 'rinkeby' });
        var privateKey = Buffer.from(WALLET_PRIVATE_KEY, 'hex');
        tx.sign(privateKey);

        const serializedTx = '0x' + tx.serialize().toString('hex');
    
        return web3.eth.sendSignedTransaction(serializedTx.toString('hex'), function(err, hash) {
            if(!err) {
                console.log('Signed Transaction sent and Hash Value is: ' + hash);
            }
            else{
                console.error(err);
            }
        })
        
    } catch (error) {
        console.log(error);
    }
}

async function swap() {
    try {
        let result;
  
        // Check Ether balance
        console.log(`ETH balance of ${WALLET_PUBLIC_KEY} = ${web3.utils.fromWei(
            await web3.eth.getBalance(WALLET_PUBLIC_KEY)
          )}`);
    
        // Check Dai balance
        console.log(`DAI balance of ${WALLET_PUBLIC_KEY} = ${web3.utils.fromWei(
            await DAI.methods.balanceOf(WALLET_PUBLIC_KEY).call(),
          )}`)

        // Deciding on the maximum gas price 
        var maxGasPrice = await ContractInstance.methods.checkGas().call();
        var gasPrice = web3.utils.toWei(new BN(5), 'gwei');
        if (gasPrice >= maxGasPrice) gasPrice = maxGasPrice;

        // Calling the smart contract function to perform trade between ETH and ERC20 token
        let txObject = ContractInstance.methods.swap(
            DEST_TOKEN_ADDRESS, 
            WALLET_PUBLIC_KEY
        );

        let transactionResult = await sendTx(txObject, CONTRACT_ADDRESS, gasPrice);

        // Check Updated Ether balance
        console.log(`ETH balance of ${WALLET_PUBLIC_KEY} = ${web3.utils.fromWei(
            await web3.eth.getBalance(WALLET_PUBLIC_KEY)
          )}`);
    
        // Check Updated Dai balance
        console.log(`DAI balance of ${WALLET_PUBLIC_KEY} = ${web3.utils.fromWei(
            await DAI.methods.balanceOf(WALLET_PUBLIC_KEY).call(),
          )}`)

        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

swap();
