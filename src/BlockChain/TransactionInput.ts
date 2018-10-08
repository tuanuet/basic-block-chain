import TransactionOutput from './TransactionOutput';

interface ITransactionInput {
    
}
export default class TransactionInput {
    transactionOutputId: string; //Reference to TransactionOutputs -> transactionId
    UTXO: TransactionOutput = new TransactionOutput('', 0,''); //Contains the Unspent transaction output

    public constructor(transactionOutputId: string) {
        this.transactionOutputId = transactionOutputId;
    }
}