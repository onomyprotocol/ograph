import {Transaction as WNOMTransactionEvent} from "../generated/BondingNOM/BondingNOM"
import {WNOMHistoricalFrame, WNOMTransaction} from "../generated/schema";
import {BigInt, log} from "@graphprotocol/graph-ts";
import {Frame, FrameType} from "./Frame";
import {join} from "./utils";

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
        let frameEntity = WNOMHistoricalFrame.load(id)
        if (frameEntity == null) {
            frameEntity = new WNOMHistoricalFrame(id);
            frameEntity.type = frameType;
            frameEntity.startTime = BigInt.fromI32(frame.startTime)
            // in case start time eq block time the price is calculate based on current supply.
            if (frame.startTime === timeStamp.toI32()) {
                log.info("start frame {} time {} is equal to block time, compute start by supply", [frame.getID(), frame.startTime.toString()])
                frameEntity.startPrice = computePrice(event.params.supply)
            } else {
                log.info("start frame {} time {} compute start by prev supply", [frame.getID(), frame.startTime.toString()])
                frameEntity.startPrice = computePrevPrice(event.params.buyOrSell, event.params.amountNOM, event.params.supply)
            }
            frameEntity.endTime = BigInt.fromI32(frame.endTime)
            frameEntity.transactionsCount = BigInt.fromI32(0)
            frameEntity.minPrice = frameEntity.startPrice
            frameEntity.maxPrice = frameEntity.startPrice
        }

        frameEntity.transactionsCount = frameEntity.transactionsCount.plus(BigInt.fromI32(1))
        frameEntity.updateTime = timeStamp
        frameEntity.endPrice = computePrice(event.params.supply);
        frameEntity.minPrice = computeMinPrice(frameEntity.minPrice, frameEntity.endPrice)
        frameEntity.maxPrice = computeMaxPrice(frameEntity.maxPrice, frameEntity.endPrice)

        frameEntity.save();
    }
}

// computePrevPrice computes the
function computePrevPrice(buyOrSell: string, amountNOM: BigInt, supply: BigInt): BigInt {
    if (buyOrSell.trim() == "buy") {
        return computePrice(supply.minus(amountNOM))
    }
    return computePrice(supply.plus(amountNOM))
}

// computePrice computes the token price (ETH/wNOM) based on supply.
// The formula is taken from the BoundingNOM contract - priceAtSupply.
function computePrice(supply: BigInt): BigInt {
    return supply.div(BigInt.fromI32(100000000)).pow(2).div(BigInt.fromI32(10).pow(18))
}

// computeMinPrice returns min price based on updatePrice or currentPrice if it is already min.
function computeMinPrice(currentPrice: BigInt, updatePrice: BigInt): BigInt {
    if (currentPrice.gt(updatePrice)) {
        return updatePrice
    }
    return currentPrice
}

// computeMaxPrice returns mxp price based on updatePrice or currentPrice if it is already max.
function computeMaxPrice(currentPrice: BigInt, updatePrice: BigInt): BigInt {
    if (currentPrice.lt(updatePrice)) {
        return updatePrice
    }
    return currentPrice
}
