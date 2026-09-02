import { ProcessedPageResult } from './types.js';
import { logger } from '../../logger/JsonLogger.js';

export class DuplicateDetector {
  /**
   * پاراگراف‌های تکراری بین صفحات را حذف می‌کند.
   * فقط اولین وقوع هر پاراگراف حفظ می‌شود.
   */
  public removeDuplicates(results: ProcessedPageResult[]): ProcessedPageResult[] {
    const seenParagraphs = new Set<string>();
    const deduplicated: ProcessedPageResult[] = [];

    for (const result of results) {
      if (result.status !== 'success' || !result.text) {
        deduplicated.push(result);
        continue;
      }

      const paragraphs = result.text.split(/\n\n+/);
      const uniqueParagraphs: string[] = [];
      let duplicateCount = 0;

      for (const paragraph of paragraphs) {
        const normalized = this.normalizeParagraph(paragraph);
        
        // فقط پاراگراف‌های معنادار را بررسی کن (حداقل 50 کاراکتر)
        if (normalized.length < 50) {
          uniqueParagraphs.push(paragraph);
          continue;
        }

        if (seenParagraphs.has(normalized)) {
          duplicateCount++;
          // تغییر debug به info
          logger.info('Duplicate paragraph removed', {
            url: result.url,
            paragraphLength: paragraph.length,
          });
        } else {
          seenParagraphs.add(normalized);
          uniqueParagraphs.push(paragraph);
        }
      }

      if (duplicateCount > 0) {
        logger.info('Duplicates removed from page', {
          url: result.url,
          duplicateCount,
          remainingParagraphs: uniqueParagraphs.length,
        });
      }

      deduplicated.push({
        ...result,
        text: uniqueParagraphs.join('\n\n'),
      });
    }

    return deduplicated;
  }

  /**
   * نرمال‌سازی پاراگراف برای مقایسه:
   * - trim کردن
   * - تبدیل به lowercase
   * - حذف whitespace اضافی
   */
  private normalizeParagraph(paragraph: string): string {
    return paragraph
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }
}