import * as StringUtil from '../Utils';
import Transaction from './Transaction';


export default class Block {
    public hash: string = '';
    public previousHash: string = '';
    public merkleRoot: string = '';
    public transactions = new Array<Transaction>(); //our data will be a simple message.
    private timeStamp: number = Date.now(); //as number of milliseconds since 1/1/1970.
    private nonce: number = 0;

    constructor(previousHash: string) {
        this.previousHash = previousHash;
        this.timeStamp = new Date().getTime();
        this.hash = this.calculateHash();
    }

    public calculateHash() {
        return StringUtil.applySha256(this.merkleRoot + this.previousHash + this.timeStamp + this.nonce);
    }

    public mineBlock(difficulty: number) {
        this.merkleRoot = StringUtil.getMerkleRoot(this.transactions);
        const target = Array(difficulty).fill(0).join('');
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        return this;
    }

    //Add transactions to this block
	public addTransaction(transaction: Transaction) {
		//process transaction and check if valid, unless block is genesis block then ignore.
		if(transaction == null) return false;
		if((this.previousHash !== "0")) {
			if((transaction.processTransaction() != true)) {
				console.log("Transaction failed to process. Discarded.");
				return false;
			}
		}
		this.transactions.push(transaction);
		console.log("Transaction Successfully added to Block");
		return true;
	}
}
