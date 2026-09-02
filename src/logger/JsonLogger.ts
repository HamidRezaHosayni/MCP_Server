import fs from 'fs';
import path from 'path';
import { Logger } from './Logger.js';
import { LogLevel, LogEntry } from './types.js';
import { config } from '../config/config.js';

export class JsonLogger implements Logger {
  constructor() {
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    try {
      const dir = path.dirname(config.loggerPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(config.loggerPath)) {
        fs.writeFileSync(config.loggerPath, '[]', 'utf-8');
      }
    } catch {
      // کاملاً بی‌صدا (Silent) برای جلوگیری از آلوده کردن stdio و قطع ارتباط MCP
    }
  }

  private maskSensitiveData(data: string): string {
    return data
      .replace(/(password|pass|pwd|token|api[_-]?key|secret|authorization|cookie)["']?\s*[:=]\s*["']?[^"'\s,}]+["']?/gi, '$1=***')
      .replace(/Bearer\s+[A-Za-z0-9\-_]+/gi, 'Bearer ***');
  }

  private writeLog(entry: LogEntry): void {
    try {
      const maskedEntry = {
        ...entry,
        command: entry.command ? this.maskSensitiveData(entry.command) : undefined,
        message: this.maskSensitiveData(entry.message)
      };

      const fileContent = fs.readFileSync(config.loggerPath, 'utf-8');
      const logs: LogEntry[] = fileContent.trim() === '' ? [] : JSON.parse(fileContent);
      
      logs.push(maskedEntry);
      
      fs.writeFileSync(config.loggerPath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch {
      // هرگز اینجا console.error ننویسید! ارتباط با کلاینت MCP قطع می‌شود.
    }
  }

  private createEntry(level: LogLevel, message: string, context?: Partial<LogEntry>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    };
  }

  public info(message: string, context?: Partial<LogEntry>): void {
    this.writeLog(this.createEntry('info', message, context));
  }

  public warn(message: string, context?: Partial<LogEntry>): void {
    this.writeLog(this.createEntry('warn', message, context));
  }

  public error(message: string, context?: Partial<LogEntry>): void {
    this.writeLog(this.createEntry('error', message, context));
  }
}

export const logger = new JsonLogger();