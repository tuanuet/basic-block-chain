import * as StringUtils from '../Utils';
export default class TransactionOutput {
    id: string = '';
    recipient: string = ''; //also known as the new owner of these coins.
	value: number = 0; //the amount of coins they own
	parentTransactionId: string = ''; //the id of the transaction this output was created in
	
    //Constructor
	constructor(recipient: string, value: number, parentTransactionId: string) {
		this.recipient = recipient;
		this.value = value;
		this.parentTransactionId = parentTransactionId;
		this.id = StringUtils.applySha256(
            this.recipient +
            this.value +
            this.parentTransactionId);
	}
	
	//Check if coin belongs to you
	public isMine(publicKey: string) {
		return (publicKey === this.recipient);
	}
}