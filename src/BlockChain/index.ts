import Block from './Block';
import Transaction from './Transaction';
import TransactionOutput from './TransactionOutput';

export default class AbsoluteChain {
    blocks: Array<Block> = new Array();
    public difficulty: number = 3;
    static UTXOs = new Map<String, TransactionOutput>(); //list of all unspent transactions.
    static minimumTransaction = 5;
    genesisTransaction: Transaction;

    constructor(genesisTransaction: Transaction) {
        this.genesisTransaction = genesisTransaction;
    }

    getLastBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    isValidChain() {
        const hashTarget = Array(this.difficulty).fill(0).join('');
        const tempUTXOs = new Map<String, TransactionOutput>(); //a temporary working list of unspent transactions at a given block state.
        tempUTXOs.set(this.genesisTransaction.outputs[0].id, this.genesisTransaction.outputs[0]);

        for (let index = 1; index < this.blocks.length; index++) {
            const previousBlock = this.blocks[index - 1];
            const currentBlock = this.blocks[index];

            //compare registered hash and calculated hash:
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log("#Current Hashes not equal");
                return false;
            }
            //compare previous hash and registered previous hash
            if (previousBlock.hash !== currentBlock.previousHash) {
                console.log("#Previous Hashes not equal");
                return false;
            }
            //check if hash is solved
            if (currentBlock.hash.substring(0, this.difficulty) !== hashTarget) {
                console.log("#This block hasn't been mined");
                return false;
            }

            let tempOutput: TransactionOutput;
            for (let t = 0; t < currentBlock.transactions.length; t++) {
                const currentTransaction = currentBlock.transactions[t];

                if (!currentTransaction.verifiySignature()) {
                    console.log("#Signature on Transaction(" + t + ") is Invalid");
                    return false;
                }
                if (currentTransaction.getInputsValue() != currentTransaction.getOutputsValue()) {
                    console.log("#Inputs are note equal to outputs on Transaction(" + t + ")");
                    return false;
                }

                currentTransaction.inputs.forEach(input => {
                    tempOutput = <TransactionOutput>tempUTXOs.get(input.transactionOutputId);

                    if (tempOutput == null) {
                        console.log("#Referenced input on Transaction(" + t + ") is Missing");
                        return false;
                    }

                    if (input.UTXO.value != tempOutput.value) {
                        console.log("#Referenced input Transaction(" + t + ") value is Invalid");
                        return false;
                    }

                    tempUTXOs.delete(input.transactionOutputId);
                })

                currentTransaction.outputs.forEach( output => {
                    tempUTXOs.set(output.id, output);
                })

                if (currentTransaction.outputs[0].recipient != currentTransaction.recipient) {
                    console.log("#Transaction(" + t + ") output reciepient is not who it should be");
                    return false;
                }
                if (currentTransaction.outputs[1].recipient != currentTransaction.sender) {
                    console.log("#Transaction(" + t + ") output 'change' is not sender.");
                    return false;
                }

            }

        }
        return true;
    }

    public addBlock(newBlock: Block) {
        newBlock.mineBlock(this.difficulty);
        this.blocks.push(newBlock);
    }
}
