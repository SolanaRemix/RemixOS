export interface LogEvent {
  step: string;
  message?: string;
  data?: unknown;
  timestamp?: number;
}
