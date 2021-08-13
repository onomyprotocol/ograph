import {Transaction} from "../generated/BondingNOM/BondingNOM"
import {WNOMTransaction} from "../generated/schema";

export function handleBondingNOMTransactionEvent(event: Transaction): void {
    updateWNOMTransactionEntity(event);
}

function updateWNOMTransactionEntity(event: Transaction): void {
    let timeStamp = event.block.timestamp;
    // ID: ${msg.sender}-${timeStamp}-${buy/sell}
    let id = join([event.params._by.toHexString(), timeStamp.toString(), event.params.buyOrSell.toString()]);

    // duplicated entity
    if (WNOMTransaction.load(id)) {
        return;
    }

    let trx = new WNOMTransaction(id);
    trx.timestamp = timeStamp;
    trx.amountETH = event.params.amountETH;
    trx.amountNOM = event.params.amountNOM;
    trx.buyOrSell = event.params.buyOrSell === 'sell';
    trx.senderAddress = event.params._by;
    trx.price = event.params.price;
    trx.supply = event.params.supply;
    trx.slippage = event.params.slippage;

    trx.save();
}

function join(args: Array<string>): string {
    return args.join('-');
}