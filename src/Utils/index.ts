import crypto from 'crypto';
import CryptoJs from 'crypto-js';
import Transaction from '../BlockChain/Transaction';

export const applySha256 = (input: string) => {
    return CryptoJs.SHA256(input).toString(CryptoJs.enc.Hex);
}

export function applyECDSASig(key: string, hashBuffer: string) {
    const sign = crypto.createSign('SHA256');
    sign.update(hashBuffer);
    const asn1SigBuffer = sign.sign(key);
    return asn1SigBuffer;
}

export function verifyECDSASig(key: string, data: any, signature: Buffer) {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(key, signature);
}

//Tacks in array of transactions and returns a merkle root.
export const getMerkleRoot = (transactions: Transaction[]) => {
    let count = transactions.length;
    let previousTreeLayer = new Array<string>();
    transactions.forEach(transaction => {
        previousTreeLayer.push(transaction.transactionId);
    })

    let treeLayer = previousTreeLayer;
    while (count > 1) {
        treeLayer = new Array<string>();
        for (let i = 1; i < previousTreeLayer.length; i++) {
            treeLayer.push(applySha256(previousTreeLayer[i - 1] + previousTreeLayer[i]));
        }
        count = treeLayer.length;
        previousTreeLayer = treeLayer;
    }
    const merkleRoot = (treeLayer.length == 1) ? treeLayer[0] : "";
    return merkleRoot;
}
