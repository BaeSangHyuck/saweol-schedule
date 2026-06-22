import { describe, it, expect } from "vitest";
import {
  timeToMinutes, minutesToTime, buildTimeSlots,
  slotIndexOf, spanSlots, isFull, weekDates,
} from "./schedule";

describe("time helpers", () => {
  it("converts HH:MM to minutes and back", () => {
    expect(timeToMinutes("08:30")).toBe(510);
    expect(minutesToTime(510)).toBe("08:30");
  });
});

describe("buildTimeSlots", () => {
  it("makes 30-min slots from open to close inclusive of open, exclusive of close", () => {
    const slots = buildTimeSlots("08:00", "10:00", 30);
    expect(slots).toEqual(["08:00", "08:30", "09:00", "09:30"]);
  });
});

describe("slotIndexOf / spanSlots", () => {
  it("finds the row index of a start time", () => {
    const slots = buildTimeSlots("08:00", "23:00", 30);
    expect(slotIndexOf(slots, "14:00")).toBe(12);
  });
  it("computes how many slots a duration spans", () => {
    expect(spanSlots(120, 30)).toBe(4);
    expect(spanSlots(90, 30)).toBe(3);
    expect(spanSlots(45, 30)).toBe(2); // 올림
  });
});

describe("isFull", () => {
  it("returns false when capacity is null (무제한)", () => {
    expect(isFull(99, null)).toBe(false);
  });
  it("returns true when current >= capacity", () => {
    expect(isFull(4, 4)).toBe(true);
    expect(isFull(3, 4)).toBe(false);
  });
});

describe("weekDates", () => {
  it("returns Mon..Sun for a date in that week", () => {
    const dates = weekDates("2026-06-17"); // 수요일
    expect(dates[0]).toBe("2026-06-15"); // 월
    expect(dates[6]).toBe("2026-06-21"); // 일
    expect(dates).toHaveLength(7);
  });
});
