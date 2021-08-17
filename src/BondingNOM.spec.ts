import {Frame, FrameType} from './BondingNOM';

jest.mock('@graphprotocol/graph-ts', () => {
    return {
        BigInt: class BigInt {
            static fromI32: (value: number) => number = (value) => value
        },
    };
});

jest.mock('../generated/BondingNOM/BondingNOM', () => {
    return {
        Transaction: class Transaction {
            constructor() {
                this.transaction = {
                    from: {
                        toHex: jest.fn()
                    }
                }
            }
            transaction: any
        },
    };
});

jest.mock('../generated/schema', () => {
    return {
        WNOMTransaction: class WNOMTransaction {
            static load: any = (...args: any) => jest.fn()(...args)
            save: any = jest.fn()
        },
    };
});

describe.only.each([
    // type, block timestamp, start timestamp, end timestamp
    [FrameType.Minute, 1628085048, 1628085000, 1628085059, "Minute-1628085000"],
])('new Frame', (type, timestamp, startTime, endTime, id) => {
    test(`type ${type}`, () => {
        let frame = new Frame(timestamp, type)
        expect(frame.type).toBe(type)
        expect(frame.startTime).toBe(startTime)
        expect(frame.endTime).toBe(endTime)
        expect(frame.getID()).toBe(id)
    });
});