import {Transaction as WNOMTransactionEvent} from "../generated/BondingNOM/BondingNOM"
import {WNOMHistoricalFrame, WNOMTransaction} from "../generated/schema";
import {BigInt, log} from "@graphprotocol/graph-ts";

// FrameType namespace provides constants and method for enum FrameType.
// This the hint to let assemblyscript compile the enum operations.
export namespace FrameType {
    export const Minute = "Minute",
        QuarterHour = "QuarterHour",
        Hour = "Hour",
        Day = "Day"

    export function all(): string[] {
        return [
            Minute,
            QuarterHour,
            Hour,
            Day
        ]
    }
}

export type FrameType = string

// Frame holds the logic of time framing for supported types.
export class Frame {
    type: FrameType;
    startTime: i32
    endTime: i32

    // create frame based on timestamp and FrameType scale.
    constructor(timestamp: i32, type: FrameType) {
        let scale = 0
        if (type == FrameType.Minute) {
            scale = 60
        }
        if (type == FrameType.QuarterHour) {
            scale = 60 * 15
        }
        if (type == FrameType.Hour) {
            scale = 60 * 60
        }
        if (type == FrameType.Day) {
            scale = 60 * 60 * 24
        }

        if (scale == 0) {
            throw new Error(`Unexpected WNOMHistoricalFrameType ${type}`);
        }

        this.type = type
        let roundedTimestamp = (Math.trunc(timestamp / scale)) * scale as i32
        this.startTime = roundedTimestamp
        this.endTime = roundedTimestamp + scale - 1
    }

    getID(): string {
        return join([this.type, this.startTime.toString()])
    }
}

// handleBondingNOMTransactionEvent is an entrypoint for BoundingNom:Transaction Event.
export function handleBondingNOMTransactionEvent(event: WNOMTransactionEvent): void {
    log.info("handle BondingNOM Transaction event, block number {}", [event.block.number.toString()])
    updateWNOMTransactionEntity(event);
    updateWNOMHistoricalFrame(event);
}

// updateWNOMTransactionEntity upserts all the BoundingNom:Transaction Events via WNOMTransaction entity.
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

// updateWNOMTransactionEntity upserts aggregated WNOMHistoricalFrames based on BoundingNom:Transaction Events.
export function updateWNOMHistoricalFrame(event: WNOMTransactionEvent): void {
    let timeStamp = event.block.timestamp;
    let frameTypes = FrameType.all()
    for (let i = 0; i < frameTypes.length; i++) {
        let frameType = frameTypes[i]
        let frame = new Frame(timeStamp.toI32(), frameType)
        let id = frame.getID();

        let historicalFrame = WNOMHistoricalFrame.load(id)
        if (historicalFrame == null) {
            historicalFrame = new WNOMHistoricalFrame(id);
            historicalFrame.type = frameType;
            historicalFrame.startTime = BigInt.fromI32(frame.startTime)
            // in case start time eq block time the price is calculate based on current supply.
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
}

// computePrevPrice computes the
function computePrevPrice(buyOrSell: string, amountNOM: BigInt, supply: BigInt): BigInt {
    if (buyOrSell.trim() == "buy") {
        return computePrice(supply.minus(amountNOM))
    }
    return computePrice(supply.plus(amountNOM))
}

// computePrice compute the token price (ETH/wNOM) based on supply.
// The formula is taken from the BoundingNOM contract - priceAtSupply.
export function computePrice(supply: BigInt): BigInt {
    return supply.div(BigInt.fromI32(100000000)).pow(2).div(BigInt.fromI32(10).pow(18))
}

function join(args: Array<string>): string {
    return args.join('-');
}