import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { FetchedPage, ExtractedContent } from './types.js';
import { logger } from '../../logger/JsonLogger.js';

export class ContentExtractor {
  /**
   * محتوای یک صفحه را استخراج می‌کند.
   * Text و Code از ابتدا جدا نگه داشته می‌شوند.
   */
  public extract(page: FetchedPage): ExtractedContent | null {
    if (page.status !== 'success' || !page.html) {
      return null;
    }

    try {
      // مرحله ۱: استخراج Code Blocks قبل از هر پردازش دیگر
      const codeBlocks = this.extractCodeBlocks(page.html);

      // مرحله ۲: حذف نویزهای اولیه با Cheerio
      const cleanedHtml = this.removeInitialNoise(page.html);

      // مرحله ۳: استفاده از Readability برای استخراج Main Text
      const mainText = this.extractMainText(cleanedHtml, page.url);

      return {
        text: mainText,
        code: codeBlocks,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Content extraction failed', {
        url: page.url,
        error: message,
      });
      return null;
    }
  }

  /**
   * استخراج Code Blocks از HTML.
   * تگ‌های <pre><code> و <code> را پیدا می‌کند و با زبان (در صورت وجود) برمی‌گرداند.
   */
  private extractCodeBlocks(html: string): string {
    const $ = cheerio.load(html);
    const codeBlocks: string[] = [];

    // پیدا کردن تمام <pre><code> و <pre>ها
    $('pre').each((_, element) => {
      const codeElement = $(element).find('code');
      let code = '';
      let language = '';

      if (codeElement.length > 0) {
        code = codeElement.text();
        // استخراج زبان از کلاس (مثل language-typescript یا lang-js)
        const classAttr = codeElement.attr('class') || '';
        const langMatch = classAttr.match(/(?:language|lang)-(\w+)/i);
        if (langMatch) {
          language = langMatch[1];
        }
      } else {
        code = $(element).text();
      }

      if (code && code.trim().length > 0) {
        const header = language ? `CODE [${language}]:` : 'CODE:';
        codeBlocks.push(`\n${header}\n${code.trim()}\n`);
      }

      // حذف code block از DOM تا Readability آن را به عنوان متن عادی نخواند
      $(element).remove();
    });

    return codeBlocks.join('\n\n');
  }

  /**
   * حذف نویزهای اولیه با Cheerio قبل از Readability.
   * این کار باعث می‌شود Readability بهتر عمل کند.
   */
  private removeInitialNoise(html: string): string {
    const $ = cheerio.load(html);

    // حذف تگ‌های غیرضروری
    const noiseSelectors = [
      'script',
      'style',
      'noscript',
      'iframe',
      'svg',
      'nav',
      'footer',
      'header',
      'aside',
      '[role="navigation"]',
      '[role="banner"]',
      '[role="contentinfo"]',
      '.advertisement',
      '.ads',
      '.ad',
      '.cookie-banner',
      '.social-share',
      '.comments',
      '.newsletter',
      '.popup',
      '.modal',
    ];

    for (const selector of noiseSelectors) {
      $(selector).remove();
    }

    return $.html();
  }

  /**
   * استفاده از Readability برای استخراج محتوای اصلی.
   */
  private extractMainText(html: string, url: string): string {
    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article || !article.textContent) {
        return '';
      }

      return article.textContent;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.warn('Readability extraction failed', {
        url,
        error: message,
      });
      return '';
    }
  }
}
