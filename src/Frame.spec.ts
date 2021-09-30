/// <reference types="@as-pect/assembly/types/as-pect" />
import {Frame, FrameType} from "./Frame";

describe('new Frame', () => {

    it("Minute", () => {
        testNewFrame(FrameType.Minute, 1628085048, 1628085000, 1628085059, "Minute-1628085000")
    });

    it("FiveMinute", () => {
        testNewFrame(FrameType.FiveMinute, 1628085048, 1628085000, 1628085599, "FiveMinute-1628085000")
    });

    it("QuarterHour", () => {
        testNewFrame(FrameType.QuarterHour, 1628085048, 1628084700, 1628085599, "QuarterHour-1628084700")
    });

    it("Hour", () => {
        testNewFrame(FrameType.Hour, 1628085048, 1628082000, 1628085599, "Hour-1628082000")
    });

    it("QuarterDay", () => {
        testNewFrame(FrameType.QuarterDay, 1628085048, 1628078400, 1628099999, "QuarterDay-1628078400")
    });

    it("Day", () => {
        testNewFrame(FrameType.Day, 1628085048, 1628035200, 1628121599, "Day-1628035200")
    });

    it("Week - Mon to Mon", () => {
        // Monday, 2 August -> Monday, 2 August
        testNewFrame(FrameType.Week, 1627912799, 1627862400, 1628467199, "Week-1627862400")
    });

    it("Week - Thursday to Mon", () => {
        // Friday, 6 August -> Monday, 2 August
        testNewFrame(FrameType.Week, 1628171999, 1627862400, 1628467199, "Week-1627862400")
    });

    it("Week - Sun to Mon", () => {
        // Sunday, 8 August > Monday, 2 August
        testNewFrame(FrameType.Week, 1628431199, 1627862400, 1628467199, "Week-1627862400")
    });

});

function testNewFrame(type: FrameType, timestamp: i32, startTime: i32, endTime: i32, id: string): void {
    let frame = new Frame(timestamp, type)
    expect(frame.type).toBe(type)
    expect(frame.startTime).toBe(startTime)
    // expect(frame.endTime).toBe(endTime)
    expect(frame.getID()).toBe(id)
}

