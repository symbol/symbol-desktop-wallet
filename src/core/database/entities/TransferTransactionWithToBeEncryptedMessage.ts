import {
    Deadline,
    Message,
    Mosaic,
    NetworkType,
    PublicAccount,
    TransactionVersion,
    TransferTransaction,
    UInt64,
    UnresolvedAddress,
} from 'symbol-sdk';

export class TransferTransactionWithToBeEncryptedMessage extends TransferTransaction {
    constructor(
        public recipientAcount: PublicAccount,
        deadline: Deadline,
        mosaics: Mosaic[],
        message: Message,
        networkType: NetworkType,
        recipientAddress: UnresolvedAddress,
        maxFee?: UInt64,
        signature?: string,
        signer?: PublicAccount,
    ) {
        super(networkType, TransactionVersion.TRANSFER, deadline, maxFee, recipientAddress, mosaics, message, signature, signer);
    }
}
