import { describe, expect, it } from "vitest";
import { clampOverwhelm, mapOverwhelmToSupportLevel, setSessionState, snapOverwhelm } from "./sessionState";

describe("session state mapping", () => {
  it("maps overwhelm ranges to support levels", () => {
    expect(mapOverwhelmToSupportLevel(0)).toBe("normal");
    expect(mapOverwhelmToSupportLevel(24)).toBe("normal");
    expect(mapOverwhelmToSupportLevel(25)).toBe("gentle");
    expect(mapOverwhelmToSupportLevel(74)).toBe("gentle");
    expect(mapOverwhelmToSupportLevel(75)).toBe("overloaded");
    expect(mapOverwhelmToSupportLevel(100)).toBe("overloaded");
  });

  it("snaps to 25 point increments", () => {
    expect(snapOverwhelm(12)).toBe(0);
    expect(snapOverwhelm(13)).toBe(25);
    expect(snapOverwhelm(36)).toBe(25);
    expect(snapOverwhelm(50)).toBe(50);
    expect(snapOverwhelm(88)).toBe(100);
  });

  it("stores exact overwhelm value for session state", () => {
    const state = setSessionState(63);
    expect(state.overwhelm).toBe(63);
  });

  it("clamps out-of-range overwhelm values", () => {
    expect(clampOverwhelm(-8)).toBe(0);
    expect(clampOverwhelm(112)).toBe(100);
  });
});
