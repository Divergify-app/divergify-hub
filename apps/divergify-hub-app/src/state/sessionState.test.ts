import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clampOverwhelm,
  clearSessionState,
  isCheckInRequired,
  mapOverwhelmToSupportLevel,
  setSessionState,
  snapOverwhelm
} from "./sessionState";

function createStorageMock() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createStorageMock());
  localStorage.clear();
  clearSessionState();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-12T09:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("session state mapping", () => {
  it("maps overwhelm ranges to support levels", () => {
    expect(mapOverwhelmToSupportLevel(0)).toBe("normal");
    expect(mapOverwhelmToSupportLevel(24)).toBe("normal");
    expect(mapOverwhelmToSupportLevel(25)).toBe("medium");
    expect(mapOverwhelmToSupportLevel(49)).toBe("medium");
    expect(mapOverwhelmToSupportLevel(50)).toBe("gentle");
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

  it("keeps the same-day check-in satisfied", () => {
    setSessionState(63);
    expect(isCheckInRequired()).toBe(false);
  });

  it("requires a new check-in on the next local day", () => {
    setSessionState(63);
    vi.setSystemTime(new Date("2026-03-13T09:00:00"));
    expect(isCheckInRequired()).toBe(true);
  });

  it("clamps out-of-range overwhelm values", () => {
    expect(clampOverwhelm(-8)).toBe(0);
    expect(clampOverwhelm(112)).toBe(100);
  });
});
