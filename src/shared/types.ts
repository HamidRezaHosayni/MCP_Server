import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// فقط گروه‌هایی که واقعاً در پروژه ثبت شده‌اند
export type ToolGroup = 
  | 'system'    // terminal_execute (با تایید گرافیکی)
  | 'workspace' // مدیریت فایل و دایرکتوری (select, info, list, read, create, patch, delete)
  | 'terminal'  // workspace_terminal_execute (ایزوله)
  | 'web';      // google_search

export interface ToolMetadata {
  name: string;
  description: string;
  version: string;
  group: ToolGroup; // هر ابزار دقیقاً یک هویت دارد
}

export interface Tool<T = any> {
  metadata: ToolMetadata;
  inputSchema: z.ZodType<T>;
  execute: (args: T) => Promise<CallToolResult>;
}