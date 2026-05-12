// WebSocket event contract — keep in sync with worker-bridge runner output.

export type SessionStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface BaseEvent {
  sessionId: string;
  ts: string;
}

export interface StatusEvent extends BaseEvent {
  type: "status";
  status: SessionStatus;
}

export interface ProgressEvent extends BaseEvent {
  type: "progress";
  applied: number;
  skipped: number;
  failed: number;
  total: number;
  percent: number;
}

export interface CurrentJobEvent extends BaseEvent {
  type: "current_job";
  company: string;
  role: string;
  jobUrl: string;
  matchScore?: number;
}

export interface ActionEvent extends BaseEvent {
  type: "action";
  action:
    | "logging_in"
    | "searching"
    | "opening_job"
    | "filling_form"
    | "submitting";
}

export interface ScreenshotEvent extends BaseEvent {
  type: "screenshot";
  stepLabel: string;
  url: string; // signed URL, valid 5 min
}

export interface LogEvent extends BaseEvent {
  type: "log";
  level: "info" | "warn" | "error";
  message: string;
}

export interface ErrorEvent extends BaseEvent {
  type: "error";
  message: string;
  recoverable: boolean;
}

export interface HeartbeatEvent {
  type: "heartbeat";
}

export type SessionEvent =
  | StatusEvent
  | ProgressEvent
  | CurrentJobEvent
  | ActionEvent
  | ScreenshotEvent
  | LogEvent
  | ErrorEvent
  | HeartbeatEvent;
