import { BigInt, Address } from '@graphprotocol/graph-ts'
import { store } from "@graphprotocol/graph-ts/index";
import { Transaction } from '../../generated/BondingNOM/BondingNOM';
import { TransactionRecord } from "../../generated/schema";

export function genereateID(args:Array<string>): string {
  return args.join('-');
}

export function loadOrCreate(event:Transaction): void {
  let timeStamp = event.block.timestamp;
  // ID: ${msg.sender}-${timeStamp}-${buy/sell}
  let id = genereateID([event.params._by.toHexString(), timeStamp.toString(), event.params.buyOrSell.toString()]);
  let transactionRecord = TransactionRecord.load(id);

  if (!transactionRecord) {
    transactionRecord = new TransactionRecord(id);
    transactionRecord.timestamp = timeStamp;
    transactionRecord.amountETH = event.params.amountETH;
    transactionRecord.amountNOM = event.params.amountNOM;
    transactionRecord.buyOrSell = event.params.buyOrSell === 'buy' ? false : true;
    transactionRecord.senderAddress = event.params._by;
    transactionRecord.price = event.params.price;
    transactionRecord.supply= event.params.supply;
    transactionRecord.slippage = event.params.slippage;
  } else{
    // TODO: Check if the duplicated case
  }

  transactionRecord.save();
}