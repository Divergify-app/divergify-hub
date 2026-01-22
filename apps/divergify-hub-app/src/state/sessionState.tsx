import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SessionMode = "overloaded" | "neutral" | "ready";

type SessionState = { mode: SessionMode; setAt: string };

type SessionCtx = {
  session: SessionState | null;
  checkInRequired: boolean;
  setMode: (mode: SessionMode) => void;
  skipCheckIn: () => void;
  clearSession: () => void;
};

const STATE_KEY = "divergify.session.state";
const STATE_AT_KEY = "divergify.session.stateSetAt";
const SKIP_AT_KEY = "divergify.session.stateSkippedAt";
const TTL_MS = 12 * 60 * 60 * 1000;

const SessionStateCtx = createContext<SessionCtx | null>(null);

function isFresh(setAt: string | null) {
  if (!setAt) return false;
  const ts = Date.parse(setAt);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < TTL_MS;
}

export function getSessionState(): SessionState | null {
  try {
    const mode = localStorage.getItem(STATE_KEY) as SessionMode | null;
    const setAt = localStorage.getItem(STATE_AT_KEY);
    if (!mode || !setAt) return null;
    if (mode !== "overloaded" && mode !== "neutral" && mode !== "ready") return null;
    return { mode, setAt };
  } catch {
    return null;
  }
}

export function setSessionState(mode: SessionMode): SessionState {
  const setAt = new Date().toISOString();
  try {
    localStorage.setItem(STATE_KEY, mode);
    localStorage.setItem(STATE_AT_KEY, setAt);
    localStorage.removeItem(SKIP_AT_KEY);
  } catch {
    // ignore storage errors
  }
  return { mode, setAt };
}

export function setSessionSkip() {
  const setAt = new Date().toISOString();
  try {
    localStorage.setItem(SKIP_AT_KEY, setAt);
  } catch {
    // ignore storage errors
  }
  return setAt;
}

export function clearSessionState() {
  try {
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(STATE_AT_KEY);
  } catch {
    // ignore storage errors
  }
}

export function isCheckInRequired(): boolean {
  const state = getSessionState();
  if (state && isFresh(state.setAt)) return false;
  try {
    const skippedAt = localStorage.getItem(SKIP_AT_KEY);
    if (isFresh(skippedAt)) return false;
  } catch {
    return true;
  }
  return true;
}

function getValidSessionState() {
  const state = getSessionState();
  if (!state) return null;
  return isFresh(state.setAt) ? state : null;
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
      setMode: (mode) => {
        const next = setSessionState(mode);
        setSession(next);
        setCheckInRequired(false);
      },
      skipCheckIn: () => {
        setSessionSkip();
        setSession(null);
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
