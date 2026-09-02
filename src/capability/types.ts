import { ToolSubGroup } from '../router/types.js';

export interface Capability {
  id: string;                    // شناسه یکتا (مثلاً "web-search")
  uri: string;                   // آدرس Resource (مثلاً "capability://web-search")
  name: string;                  // نام نمایشی
  description: string;           // توضیح کوتاه برای مدل
  internalGroup: ToolSubGroup;   // گروه داخلی سرور (مدل از این بی‌خبر است)
  tools: string[];               // لیست ابزارهایی که فعال می‌شوند
}

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
}