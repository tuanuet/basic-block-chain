import keypair from 'keypair';
import BlockChain from './index';
import TransactionOutput from './TransactionOutput';
import TransactionInput from './TransactionInput';
import Transaction from './Transaction';

export default class Wallet {
    privateKey: string = '';
    publicKey: string = '';
    public UTXOs = new Map<String, TransactionOutput>(); //only UTXOs owned by this wallet.
    constructor() {
        this.generateKeyPair();
    }

    generateKeyPair() {
        const keyPair = keypair();
        this.privateKey = keyPair['private'];
        this.publicKey = keyPair['public'];
    }

    public getBalance() {
        let total = 0;
        BlockChain.UTXOs.forEach((value, key) => {
            const UTXO = value;
            if (UTXO.isMine(this.publicKey)) { //if output belongs to me ( if coins belong to me )
                this.UTXOs.set(UTXO.id, UTXO); //add it to our list of unspent transactions.
                total += UTXO.value;
            }
        })
        return total;
    }
    //Generates and returns a new transaction from this wallet.
    public sendFunds(_recipient: string, value: number) {
        if (this.getBalance() < value) { //gather balance and check funds.
            console.log("#Not Enough funds to send transaction. Transaction Discarded.");
            return null;
        }
        //create array list of inputs
        const inputs = new Array<TransactionInput>();
        let total = 0;
        this.UTXOs.forEach((_UTXO, key) => {
            const UTXO = _UTXO;
            total += UTXO.value;
            inputs.push(new TransactionInput(UTXO.id));
            if (total > value)  return;
        })

        const newTransaction = new Transaction(this.publicKey, _recipient, value, inputs);
        newTransaction.generateSignature(this.privateKey);

        inputs.forEach(input => {
            this.UTXOs.delete(input.transactionOutputId);
        })

        return newTransaction;
    }
}