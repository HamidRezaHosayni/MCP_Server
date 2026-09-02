import { ExtractedContent } from './types.js';
import { SEARCH_CONFIG } from './config.js';

export class ContentCleaner {
  /**
   * تمیزکاری نهایی محتوای استخراج‌شده.
   */
  public clean(content: ExtractedContent): ExtractedContent {
    return {
      text: this.cleanText(content.text),
      code: this.cleanCode(content.code),
    };
  }

  /**
   * تمیزکاری متن اصلی:
   * - حذف خطوط خالی متعدد
   * - نرمال‌سازی whitespace
   * - trim کردن
   * - محدود کردن طول
   */
  private cleanText(text: string): string {
    if (!text) return '';

    let cleaned = text
      // تبدیل تمام whitespaceهای غیرعادی به فاصله معمولی
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // حذف خطوط خالی متعدد (بیش از ۲ خط خالی متوالی)
      .replace(/\n{3,}/g, '\n\n')
      // حذف فاصله‌های اضافی در انتهای خطوط
      .replace(/[ \t]+$/gm, '')
      // نرمال‌سازی فاصله‌های متعدد
      .replace(/[ \t]{2,}/g, ' ')
      // trim کردن
      .trim();

    // محدود کردن طول متن به MAX_PAGE_TEXT_CHARS
    if (cleaned.length > SEARCH_CONFIG.MAX_PAGE_TEXT_CHARS) {
      cleaned = cleaned.substring(0, SEARCH_CONFIG.MAX_PAGE_TEXT_CHARS) + '\n\n[Content truncated due to length limit]';
    }

    return cleaned;
  }

  /**
   * تمیزکاری کد:
   * - trim کردن
   * - محدود کردن طول
   */
  private cleanCode(code: string): string {
    if (!code) return '';

    let cleaned = code.trim();

    // محدود کردن طول کد به MAX_CODE_CHARS
    if (cleaned.length > SEARCH_CONFIG.MAX_CODE_CHARS) {
      cleaned = cleaned.substring(0, SEARCH_CONFIG.MAX_CODE_CHARS) + '\n\n[Code truncated due to length limit]';
    }

    return cleaned;
  }
}