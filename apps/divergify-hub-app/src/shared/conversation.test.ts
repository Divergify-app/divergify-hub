import { describe, expect, it } from "vitest";
import { appointmentPrompt, finalTranscript, localConversationReply, nextAppointment, scheduledTime } from "./conversation";
import { defaultData } from "../state/store";
import type { Task } from "../state/types";

const appointment = (patch: Partial<Task> = {}): Task => ({
  id: "appointment", title: "Dentist", startAt: "2026-10-14T08:00", project: "Inbox", priority: 3,
  recurrence: "none", tags: [], checklist: [], done: false, createdAt: "", updatedAt: "", ...patch
});
const now = new Date(2026, 9, 14, 6, 0);

describe("appointment awareness", () => {
  it("uses local wall-clock time and rejects invalid, rolled-over and date-only values", () => {
    expect(scheduledTime("2026-10-14T08:00")?.getHours()).toBe(8);
    for (const value of ["2026-02-30T08:00", "2026-10-14T24:00", "2026-10-14", "2026-13-14T08:00", "2026-10-14T08:00Z"]) expect(scheduledTime(value)).toBeNull();
  });
  it("finds the next timed appointment, excluding completed, past and untimed tasks", () => {
    const result = nextAppointment([
      appointment({ id: "later", startAt: "2026-10-14T10:00" }),
      appointment({ id: "done", startAt: "2026-10-14T06:30", done: true }),
      appointment({ id: "past", startAt: "2026-10-14T05:30" }),
      appointment({ id: "all-day", startAt: undefined, dueDate: "2026-10-14" }),
      appointment()
    ], now);
    expect(result?.task.id).toBe("appointment");
    expect(result?.minutesAway).toBe(120);
  });
  it("does not invent preparation or travel time", () => {
    const result = nextAppointment([appointment()], now)!;
    expect(appointmentPrompt(result)).toContain("in 120 minutes");
    expect(appointmentPrompt(result)).toContain("How much time do you need");
  });
  it("does not treat completed appointments as live commitments", () => {
    expect(nextAppointment([appointment({ done: true })], now)).toBeNull();
  });
});

describe("spoken brain dump transcripts", () => {
  it("keeps every final result, excludes interim words, and replaces revisions rather than duplicating", () => {
    const first = Object.assign([{ transcript: "call dentist" }], { isFinal: true });
    const pending = Object.assign([{ transcript: "and maybe" }], { isFinal: false });
    const second = Object.assign([{ transcript: "buy groceries" }], { isFinal: true });
    expect(finalTranscript([first, pending])).toBe("call dentist");
    expect(finalTranscript([first, second])).toBe("call dentist buy groceries");
  });
  it("does not deliver a fabricated transcript when nothing was recognized", () => {
    expect(finalTranscript([])).toBe("");
  });
});

describe("basic local help", () => {
  it("prioritizes a nearby scheduled appointment over unrelated focus work", () => {
    const data = defaultData();
    data.tasks = [appointment()];
    expect(localConversationReply("I want to keep working on the app", data, now)).toContain("Dentist");
  });
  it("admits external calendar access is unavailable", () => {
    expect(localConversationReply("Look at my calendar", defaultData(), now)).toContain("outside calendar isn’t connected");
  });
  it("suggests an overdue task before an undated task and asks rather than executing", () => {
    const data = defaultData();
    data.tasks = [appointment({ title: "Polish logo", startAt: undefined, priority: 1 }), appointment({ title: "Pay invoice", startAt: undefined, dueDate: "2026-10-13", priority: 3 })];
    expect(localConversationReply("What needs my focus first?", data, now)).toBe("“Pay invoice” is the next candidate from your saved tasks. Does that still need to come first?");
    expect(data.tasks).toHaveLength(2);
    expect(data.tasks.every(task => !task.done)).toBe(true);
  });
  it("keeps overload support to one question", () => {
    const answer = localConversationReply("I am overwhelmed", defaultData(), now);
    expect(answer.match(/\?/g)).toHaveLength(1);
    expect(answer.length).toBeLessThan(120);
  });
});
