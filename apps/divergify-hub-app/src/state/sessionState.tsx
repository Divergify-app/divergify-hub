import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SessionMode = "overloaded" | "neutral" | "ready";
export type SupportLevel = "normal" | "medium" | "gentle" | "overloaded";

type SessionState = { mode: SessionMode; setAt: string; overwhelm: number };

type SessionCtx = {
  session: SessionState | null;
  checkInRequired: boolean;
  setOverwhelm: (value: number) => void;
  skipCheckIn: () => void;
  clearSession: () => void;
};

const STATE_KEY = "divergify.session.state";
const STATE_AT_KEY = "divergify.session.stateSetAt";
const OVERWHELM_KEY = "divergify.session.overwhelm";
const SKIP_AT_KEY = "divergify.session.stateSkippedAt";

const SessionStateCtx = createContext<SessionCtx | null>(null);

function toLocalDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dayKeyFromIso(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toLocalDayKey(parsed);
}

function isCurrentDay(value: string | null) {
  return dayKeyFromIso(value) === toLocalDayKey(new Date());
}

export function clampOverwhelm(value: number) {
  if (Number.isNaN(value)) return 50;
  return Math.max(0, Math.min(100, value));
}

export function snapOverwhelm(value: number) {
  const clamped = clampOverwhelm(value);
  return Math.round(clamped / 25) * 25;
}

export function mapOverwhelmToSupportLevel(value: number): SupportLevel {
  const clamped = clampOverwhelm(value);
  if (clamped >= 75) return "overloaded";
  if (clamped >= 50) return "gentle";
  if (clamped >= 25) return "medium";
  return "normal";
}

export function mapOverwhelmToMode(value: number): SessionMode {
  const support = mapOverwhelmToSupportLevel(value);
  if (support === "overloaded") return "overloaded";
  if (support === "gentle" || support === "medium") return "neutral";
  return "ready";
}

export function getSessionState(): SessionState | null {
  try {
    const mode = localStorage.getItem(STATE_KEY) as SessionMode | null;
    const setAt = localStorage.getItem(STATE_AT_KEY);
    const rawOverwhelm = localStorage.getItem(OVERWHELM_KEY);
    if (!mode || !setAt) return null;
    if (mode !== "overloaded" && mode !== "neutral" && mode !== "ready") return null;
    const overwhelm = rawOverwhelm ? Number(rawOverwhelm) : 50;
    return { mode, setAt, overwhelm: clampOverwhelm(overwhelm) };
  } catch {
    return null;
  }
}

export function setSessionState(value: number, skipped = false): SessionState {
  const overwhelm = clampOverwhelm(value);
  const mode = mapOverwhelmToMode(overwhelm);
  const setAt = new Date().toISOString();
  try {
    localStorage.setItem(STATE_KEY, mode);
    localStorage.setItem(STATE_AT_KEY, setAt);
    localStorage.setItem(OVERWHELM_KEY, String(overwhelm));
    if (skipped) {
      localStorage.setItem(SKIP_AT_KEY, setAt);
    } else {
      localStorage.removeItem(SKIP_AT_KEY);
    }
  } catch {
    // ignore storage errors
  }
  return { mode, setAt, overwhelm };
}

export function clearSessionState() {
  try {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(STATE_AT_KEY);
    localStorage.removeItem(OVERWHELM_KEY);
    localStorage.removeItem(SKIP_AT_KEY);
  } catch {
    // ignore storage errors
  }
}

export function isCheckInRequired(): boolean {
  const state = getSessionState();
  if (state && isCurrentDay(state.setAt)) return false;
  try {
    const skippedAt = localStorage.getItem(SKIP_AT_KEY);
    if (isCurrentDay(skippedAt)) return false;
  } catch {
    return true;
  }
  return true;
}

function getValidSessionState() {
  const state = getSessionState();
  if (!state) return null;
  return isCurrentDay(state.setAt) ? state : null;
}

function applySessionClass(mode: SessionMode | null) {
  const root = document.documentElement;
  root.classList.remove("state-overloaded", "state-neutral", "state-ready");
  if (!mode) return;
  root.classList.add(`state-${mode}`);
}

export function SessionStateProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState | null>(() => getValidSessionState());
  const [checkInRequired, setCheckInRequired] = useState(() => isCheckInRequired());

  useEffect(() => {
    applySessionClass(session?.mode ?? null);
  }, [session]);

  const value = useMemo<SessionCtx>(() => {
    return {
      session,
      checkInRequired,
      setOverwhelm: (value) => {
        const next = setSessionState(value);
        setSession(next);
        setCheckInRequired(false);
      },
      skipCheckIn: () => {
        const next = setSessionState(50, true);
        setSession(next);
        setCheckInRequired(false);
      },
      clearSession: () => {
        clearSessionState();
        setSession(null);
        setCheckInRequired(true);
      }
    };
  }, [checkInRequired, session]);

  return <SessionStateCtx.Provider value={value}>{children}</SessionStateCtx.Provider>;
}

export function useSessionState() {
  const ctx = useContext(SessionStateCtx);
  if (!ctx) throw new Error("useSessionState must be used within SessionStateProvider");
  return ctx;
}
