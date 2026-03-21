import { describe, expect, it } from "vitest";
import { normalizeBrainDumpEntry, parseBrainDump, sortBrainDumpLocally } from "./brainDump";

describe("brain dump parsing", () => {
  it("drops empty lines and keeps each task-sized chunk", () => {
    expect(
      parseBrainDump(`
        buy oat milk

        email Alex back
        book dentist
      `)
    ).toEqual(["buy oat milk", "email Alex back", "book dentist"]);
  });

  it("strips common list markers before import", () => {
    expect(
      parseBrainDump(`
        - file taxes
        2. schedule haircut
        [ ] refill meds
        b) message therapist
      `)
    ).toEqual(["file taxes", "schedule haircut", "refill meds", "message therapist"]);
  });

  it("splits inline bullets and semicolons into separate tasks", () => {
    expect(parseBrainDump("groceries; call mom • send invoice")).toEqual([
      "groceries",
      "call mom",
      "send invoice"
    ]);
  });

  it("normalizes repeated whitespace", () => {
    expect(normalizeBrainDumpEntry("   email   the   landlord   ")).toBe("email the landlord");
  });

  it("sorts actionable items into now, later prompts into later, and context into notes", () => {
    expect(
      sortBrainDumpLocally(`
        email Alex back
        later maybe research standing desks
        idea: different sidekick opening lines
      `)
    ).toEqual({
      now: ["email Alex back"],
      later: ["later maybe research standing desks"],
      notes: ["idea: different sidekick opening lines"]
    });
  });
});
