// FrameType namespace provides constants and method for enum FrameType.
// This the hint to let assemblyscript compile the enum operations.
import {join} from "./utils";

const min = 60
const hour = 60 * 60
const day = 60 * 60 * 24

export namespace FrameType {
    export const Minute = "Minute",
        QuarterHour = "QuarterHour",
        Hour = "Hour",
        QuarterDay = "QuarterDay",
        Day = "Day",
        Week = "Week"

    export function all(): string[] {
        return [
            Minute,
            QuarterHour,
            Hour,
            QuarterDay,
            Day,
            Week
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
        let shift = 0

        if (type == FrameType.Minute) {
            scale = min
        }
        if (type == FrameType.QuarterHour) {
            scale = min * 15
        }
        if (type == FrameType.Hour) {
            scale = hour
        }
        if (type == FrameType.QuarterDay) {
            scale = hour * 6
        }
        if (type == FrameType.Day) {
            scale = day
        }
        if (type == FrameType.Week) {
            scale = day
            let dayOfWeek = getUTCDay(timestamp)
            // handler UTC sunday
            if (dayOfWeek == 0) {
                dayOfWeek = 7
            }
            shift = (1 - dayOfWeek) * day
        }

        if (scale == 0) {
            throw new Error(`Unexpected WNOMHistoricalFrameType ${type}`);
        }

        this.type = type
        this.startTime = Math.trunc(timestamp / scale) * scale as i32 + shift
        this.endTime = this.startTime + scale - 1
    }

    getID(): string {
        return join([this.type, this.startTime.toString()])
    }
}

function getUTCDay(timestamp: i32): i32 {
    let dayFromThursday = Math.trunc(timestamp / day) % 7
    if (dayFromThursday < 3) {
        return dayFromThursday + 4 as i32
    }
    return dayFromThursday - 3 as i32
}
