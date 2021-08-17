import {Transaction as WNOMTransactionEvent} from "../generated/BondingNOM/BondingNOM"
import {WNOMHistoricalFrame, WNOMTransaction} from "../generated/schema";
import {BigInt, log} from "@graphprotocol/graph-ts";

export enum FrameType {
    Minute
}

// Hint to let FrameType be string and be compilable at the same time
export namespace FrameType {
    export function toString(type: FrameType): string {
        switch (type) {
            case FrameType.Minute:
                return "Minute"
            default:
                throw new Error(`Unexpected WNOMHistoricalFrameType ${type}`);
        }
    }
}

export class Frame {
    type: FrameType;
    startTime: i32
    endTime: i32

    constructor(timestamp: i32, type: FrameType) {
        let scale = 0
        switch (type) {
            case FrameType.Minute:
                scale = 60
                break;
            default:
                throw new Error(`Unexpected WNOMHistoricalFrameType ${type}`);
        }

        this.type = type
        let roundedTimestamp = (Math.trunc(timestamp / scale)) * scale as i32
        this.startTime = roundedTimestamp
        this.endTime = roundedTimestamp + scale - 1
    }

    getID(): string {
        return join([FrameType.toString(this.type), this.startTime.toString()])
    }
}

export function handleBondingNOMTransactionEvent(event: WNOMTransactionEvent): void {
    log.info("handle BondingNOM Transaction event, block number {}", [event.block.number.toString()])
    updateWNOMTransactionEntity(event);
    updateWNOMHistoricalFrame(event);
}

export function updateWNOMTransactionEntity(event: WNOMTransactionEvent): void {
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
    trx.buyOrSell = event.params.buyOrSell.trim() == "buy";
    trx.senderAddress = event.params._by;
    trx.price = event.params.price;
    trx.supply = event.params.supply;
    trx.slippage = event.params.slippage;

    trx.save();
}

export function updateWNOMHistoricalFrame(event: WNOMTransactionEvent): void {
    let timeStamp = event.block.timestamp;
    let frameType = FrameType.Minute
    let frame = new Frame(timeStamp.toI32(), frameType)

    // ID: ${type}-${startTime}
    let id = frame.getID();

    let historicalFrame = WNOMHistoricalFrame.load(id)
    if (historicalFrame == null) {
        historicalFrame = new WNOMHistoricalFrame(id);
        historicalFrame.type = FrameType.toString(frameType);
        historicalFrame.startTime = BigInt.fromI32(frame.startTime)
        if (frame.startTime === timeStamp.toI32()) {
            log.info("start frame {} time {} is equal to block time, compute start by supply", [frame.getID(), frame.startTime.toString()])
            historicalFrame.startPrice = computePrice(event.params.supply)
        } else {
            log.info("start frame {} time {} compute start by prev supply", [frame.getID(), frame.startTime.toString()])
            historicalFrame.startPrice = computePrevPrice(event.params.buyOrSell, event.params.amountNOM, event.params.supply)
        }
        historicalFrame.endTime = BigInt.fromI32(frame.endTime)
        historicalFrame.transactionsCount = BigInt.fromI32(0)
    }

    historicalFrame.transactionsCount = historicalFrame.transactionsCount.plus(BigInt.fromI32(1))
    historicalFrame.updateTime = timeStamp
    historicalFrame.endPrice = computePrice(event.params.supply);
    historicalFrame.save();
}

function computePrevPrice(buyOrSell: string, amountNOM: BigInt, supply: BigInt): BigInt {
    if (buyOrSell.trim() == "buy") {
        return computePrice(supply.minus(amountNOM))
    }
    return computePrice(supply.plus(amountNOM))
}

export function computePrice(supply: BigInt): BigInt {
    // The expression is taken from the BoundingNOM contract - priceAtSupply.
    return supply.div(BigInt.fromI32(100000000)).pow(2).div(BigInt.fromI32(10).pow(18))
}

function join(args: Array<string>): string {
    return args.join('-');
}