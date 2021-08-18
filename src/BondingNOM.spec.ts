import {Frame, FrameType} from './BondingNOM';


describe.only.each([
    // type, block timestamp, start timestamp, end timestamp
    // 1628085048 = GMT: Wednesday, 4 August 2021 13:50:48
    [FrameType.Minute, 1628085048, 1628085000, 1628085059, "Minute-1628085000"],
    [FrameType.QuarterHour, 1628085048, 1628084700, 1628085599, "QuarterHour-1628084700"],
    [FrameType.Hour, 1628085048, 1628082000, 1628085599, "Hour-1628082000"],
    [FrameType.Day, 1628085048, 1628035200, 1628121599, "Day-1628035200"],

])('new Frame', (type, timestamp, startTime, endTime, id) => {
    test(`type ${type}`, () => {
        let frame = new Frame(timestamp, type)
        expect(frame.type).toBe(type)
        expect(frame.startTime).toBe(startTime)
        expect(frame.endTime).toBe(endTime)
        expect(frame.getID()).toBe(id)
    });
});

// ------------------------------ jest mocks ------------------------------

jest.mock('@graphprotocol/graph-ts', () => {
    return {};
});

jest.mock('../generated/BondingNOM/BondingNOM', () => {
    return {};
});

jest.mock('../generated/schema', () => {
    return {};
});
