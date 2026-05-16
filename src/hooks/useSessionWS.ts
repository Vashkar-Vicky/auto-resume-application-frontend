"use client";

import { useEffect } from "react";
import { apiFetch, WS_BASE } from "@/lib/api";
import { useSessionStore } from "@/store/sessionStore";
import type { SessionEvent } from "@/types/events";

export function useSessionWS(sessionId: string | null) {
  const apply = useSessionStore((s) => s.apply);

  useEffect(() => {
    if (!sessionId) return;
    let ws: WebSocket | null = null;
    let cancelled = false;
    let retry = 0;

    const connect = async () => {
      try {
        const { ticket } = await apiFetch<{ ticket: string }>(
          `/ws/ticket?sessionId=${sessionId}`,
          { method: "GET" },
        );
        if (cancelled) return;
        ws = new WebSocket(
          `${WS_BASE}/ws/sessions/${sessionId}?ticket=${ticket}`,
        );
        ws.onmessage = (e) => {
          try {
            const ev = JSON.parse(e.data) as SessionEvent;
            apply(sessionId, ev);
          } catch {
            /* ignore */
          }
        };
        ws.onclose = () => {
          if (cancelled) return;
          // exponential backoff up to 30s
          const delay = Math.min(30_000, 500 * 2 ** retry++);
          setTimeout(connect, delay);
        };
        ws.onerror = () => ws?.close();
      } catch {
        if (!cancelled) setTimeout(connect, 2000);
      }
    };
    connect();

    return () => {
      cancelled = true;
      ws?.close();
    };
  }, [sessionId, apply]);
}
