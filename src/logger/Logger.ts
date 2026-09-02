import { LogLevel, LogEntry } from './types.js';

export interface Logger {
  info(message: string, context?: Partial<LogEntry>): void;
  warn(message: string, context?: Partial<LogEntry>): void;
  error(message: string, context?: Partial<LogEntry>): void;
}