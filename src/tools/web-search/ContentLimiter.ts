import { ProcessedPageResult } from './types.js';
import { SEARCH_CONFIG } from './config.js';
import { logger } from '../../logger/JsonLogger.js';

export class ContentLimiter {
  /**
   * اعمال محدودیت‌های کلی بر تمام نتایج:
   * - MAX_TOTAL_TEXT_CHARS
   * - MAX_CODE_BLOCKS
   * - MAX_CODE_CHARS
   */
  public limit(results: ProcessedPageResult[]): ProcessedPageResult[] {
    let totalTextChars = 0;
    let totalCodeBlocks = 0;
    let totalCodeChars = 0;

    const limited: ProcessedPageResult[] = [];

    for (const result of results) {
      if (result.status !== 'success') {
        limited.push(result);
        continue;
      }

      const limitedResult = { ...result };

      // محدودسازی متن
      if (limitedResult.text) {
        const originalLength = limitedResult.text.length;
        const remainingTextBudget = SEARCH_CONFIG.MAX_TOTAL_TEXT_CHARS - totalTextChars;
        
        if (remainingTextBudget <= 0) {
          limitedResult.text = '[Content limit reached - no more text allowed]';
          logger.info('Text limit reached', {
            url: result.url,
            totalTextChars,
          });
        } else if (originalLength > remainingTextBudget) {
          limitedResult.text = limitedResult.text.substring(0, remainingTextBudget) + 
            '\n\n[Text truncated due to total limit]';
          logger.info('Text truncated due to total limit', {
            url: result.url,
            originalLength,
            truncatedLength: limitedResult.text.length,
          });
        }

        totalTextChars += limitedResult.text.length;
      }

      // محدودسازی کد
      if (limitedResult.code) {
        const codeBlocks = limitedResult.code.split(/\n\nCODE/);
        const limitedCodeBlocks: string[] = [];

        for (const block of codeBlocks) {
          if (totalCodeBlocks >= SEARCH_CONFIG.MAX_CODE_BLOCKS) {
            logger.info('Code blocks limit reached', {
              url: result.url,
              totalCodeBlocks,
            });
            break;
          }

          if (totalCodeChars + block.length > SEARCH_CONFIG.MAX_CODE_CHARS) {
            const remaining = SEARCH_CONFIG.MAX_CODE_CHARS - totalCodeChars;
            if (remaining > 100) {
              limitedCodeBlocks.push(block.substring(0, remaining) + '\n[Code truncated]');
              totalCodeChars += remaining;
            }
            totalCodeBlocks++;
            break;
          }

          limitedCodeBlocks.push(block);
          totalCodeChars += block.length;
          totalCodeBlocks++;
        }

        limitedResult.code = limitedCodeBlocks.join('\n\nCODE');
      }

      limited.push(limitedResult);
    }

    logger.info('Content limiting completed', {
      totalTextChars,
      totalCodeBlocks,
      totalCodeChars,
      maxTextLimit: SEARCH_CONFIG.MAX_TOTAL_TEXT_CHARS,
      maxCodeBlocks: SEARCH_CONFIG.MAX_CODE_BLOCKS,
      maxCodeChars: SEARCH_CONFIG.MAX_CODE_CHARS,
    });

    return limited;
  }
}