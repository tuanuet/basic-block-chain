import TransactionInput from "./TransactionInput";
import TransactionOutput from "./TransactionOutput";
import * as StringUtils from '../Utils';
import BlockChain from './index';

export default class Transaction {
    transactionId: string = ''; // this is also the hash of the transaction.
    sender: string = ''; // senders address/public key.
    recipient: string = ''; // Recipients address/public key.
    value: number = 0;
    signature: Buffer = Buffer.from(''); // this is to prevent anybody else from spending funds in our wallet.

    inputs = new Array<TransactionInput>();
    outputs = new Array<TransactionOutput>();

    sequence: number = 0; // a rough count of how many transactions have been generated. 

    constructor(from: string, to: string, value: number, inputs: TransactionInput[]) {
        this.sender = from;
        this.recipient = to;
        this.value = value;
        this.inputs = inputs;
    }

    // This Calculates the transaction hash (which will be used as its Id)
    private _calulateHash() {
        this.sequence++; //increase the sequence to avoid 2 identical transactions having the same hash
        return StringUtils.applySha256(
            this.sender +
            this.recipient +
            this.value +
            this.sequence
        );
    }

    //Signs all the data we dont wish to be tampered with.
    public generateSignature(privateKey: string) {
        const data = this.sender + this.recipient + this.value;
        this.signature = StringUtils.applyECDSASig(privateKey, data);
    }
    //Verifies the data we signed hasnt been tampered with
    public verifiySignature() {
        const data = this.sender + this.recipient + this.value;
        return StringUtils.verifyECDSASig(this.sender, data, this.signature);
    }

    public processTransaction() {

        if (this.verifiySignature() == false) {
            console.log("#Transaction Signature failed to verify");
            return false;
        }

        //gather transaction inputs (Make sure they are unspent):
        this.inputs.forEach(i => {
            (<any>i.UTXO) = BlockChain.UTXOs.get(i.transactionOutputId);
        });

        //check if transaction is valid:
        if (this.getInputsValue() < BlockChain.minimumTransaction) {
            console.log("#Transaction Inputs to small: " + this.getInputsValue());
            return false;
        }

        //generate transaction outputs:
        const leftOver = this.getInputsValue() - this.value; //get value of inputs then the left over change:
        this.transactionId = this._calulateHash();
        this.outputs.push(new TransactionOutput(this.recipient, this.value, this.transactionId)); //send value to recipient
        this.outputs.push(new TransactionOutput(this.sender, leftOver, this.transactionId)); //send the left over 'change' back to sender		

        //add outputs to Unspent list
        this.outputs.forEach(o => {
            BlockChain.UTXOs.set(o.id, o);
        })

        //remove transaction inputs from UTXO lists as spent:
        this.inputs.forEach(i => {
            if (i.UTXO == null) {}; //if Transaction can't be found skip it 
            BlockChain.UTXOs.delete(i.UTXO.id);
        })

        return true;
    }

    //returns sum of inputs(UTXOs) values
    public getInputsValue() {
        let total = 0;
        this.inputs.forEach(i => {
            if (i.UTXO == null) {}; //if Transaction can't be found skip it 
            total += i.UTXO.value;
        })
        return total;
    }

    //returns sum of outputs:
    public getOutputsValue() {
        let total = 0;
        this.outputs.forEach(o => {
            total += o.value;

        });
        return total;
    }
}