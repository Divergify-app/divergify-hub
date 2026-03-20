import { describe, expect, it } from "vitest";
import { normalizeBrainDumpEntry, parseBrainDump } from "./brainDump";

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
});
