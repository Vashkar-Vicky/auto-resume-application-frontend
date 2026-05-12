import { create } from "zustand";
import type { SessionEvent } from "@/types/events";

interface SessionSlice {
  status: string;
  applied: number;
  skipped: number;
  failed: number;
  percent: number;
  currentCompany?: string;
  currentRole?: string;
  lastScreenshotUrl?: string;
  logTail: { level: string; message: string; ts: string }[];
  errors: { message: string; ts: string }[];
}

interface SessionStore {
  sessions: Record<string, SessionSlice>;
  apply: (sessionId: string, ev: SessionEvent) => void;
  reset: (sessionId: string) => void;
}

const empty: SessionSlice = {
  status: "queued",
  applied: 0,
  skipped: 0,
  failed: 0,
  percent: 0,
  logTail: [],
  errors: [],
};

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: {},
  reset: (sessionId) =>
    set((s) => ({ sessions: { ...s.sessions, [sessionId]: { ...empty } } })),
  apply: (sessionId, ev) =>
    set((s) => {
      if (ev.type === "heartbeat") return s;
      const slice = s.sessions[sessionId] ?? { ...empty };
      switch (ev.type) {
        case "status":
          slice.status = ev.status;
          break;
        case "progress":
          slice.applied = ev.applied;
          slice.skipped = ev.skipped;
          slice.failed = ev.failed;
          slice.percent = ev.percent;
          break;
        case "current_job":
          slice.currentCompany = ev.company;
          slice.currentRole = ev.role;
          break;
        case "screenshot":
          slice.lastScreenshotUrl = ev.url;
          break;
        case "log":
          slice.logTail = [...slice.logTail.slice(-199), {
            level: ev.level, message: ev.message, ts: ev.ts,
          }];
          break;
        case "error":
          slice.errors = [...slice.errors.slice(-49), {
            message: ev.message, ts: ev.ts,
          }];
          break;
      }
      return { sessions: { ...s.sessions, [sessionId]: { ...slice } } };
    }),
}));
