import Block from './BlockChain/Block';
import BlockChain from './BlockChain';
import Transaction from './BlockChain/Transaction';
import TransactionOutput from './BlockChain/TransactionOutput';
import Wallet from './BlockChain/Wallet';

const walletA = new Wallet();
const walletB = new Wallet();
const coinbase = new Wallet();

//create genesis transaction, which sends 100 NoobCoin to walletA:
const genesisTransaction = new Transaction(coinbase.publicKey, walletA.publicKey, 100, []);
genesisTransaction.generateSignature(coinbase.privateKey);	 //manually sign the genesis transaction
genesisTransaction.transactionId = "0"; //manually set the transaction id
genesisTransaction.outputs.push(new TransactionOutput(genesisTransaction.recipient, genesisTransaction.value, genesisTransaction.transactionId)); //manually add the Transactions Output
BlockChain.UTXOs.set(genesisTransaction.outputs[0].id, genesisTransaction.outputs[0]); //its important to store our first transaction in the UTXOs list.


const blockChain = new BlockChain(genesisTransaction);
console.log("Creating and Mining Genesis block... ");
const genesis = new Block("0");
genesis.addTransaction(genesisTransaction);
blockChain.addBlock(genesis);


//testing
const block1 = new Block(genesis.hash);
console.log("\nWalletA's balance is: " + walletA.getBalance());
console.log("\nWalletA is Attempting to send funds (40) to WalletB...");
block1.addTransaction(<Transaction>walletA.sendFunds(walletB.publicKey, 40));
blockChain.addBlock(block1);
console.log("\nWalletA's balance is: " + walletA.getBalance());
console.log("WalletB's balance is: " + walletB.getBalance());

const block2 = new Block(block1.hash);
console.log("\nWalletA Attempting to send more funds (1000) than it has...");
block2.addTransaction(<Transaction>walletA.sendFunds(walletB.publicKey, 1000));
blockChain.addBlock(block2);
console.log("\nWalletA's balance is: " + walletA.getBalance());
console.log("WalletB's balance is: " + walletB.getBalance());

const block3 = new Block(block2.hash);
console.log("\nWalletB is Attempting to send funds (20) to WalletA...");
block3.addTransaction(<Transaction>walletB.sendFunds(walletA.publicKey, 20));
console.log("\nWalletA's balance is: " + walletA.getBalance());
console.log("WalletB's balance is: " + walletB.getBalance());

blockChain.isValidChain();
