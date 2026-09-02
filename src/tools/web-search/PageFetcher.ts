import axios from 'axios';
import { WebSearchRawResult, FetchedPage } from './types.js';
import { SEARCH_CONFIG } from './config.js';
import { logger } from '../../logger/JsonLogger.js';

export class PageFetcher {
  /**
   * چندین صفحه را به صورت موازی دانلود می‌کند.
   * خطای هر صفحه به صورت ایزوله مدیریت می‌شود.
   */
  public async fetchAll(results: WebSearchRawResult[]): Promise<FetchedPage[]> {
    const fetchPromises = results.map(result => this.fetchSingle(result));
    return Promise.all(fetchPromises);
  }

  /**
   * دانلود یک صفحه با مدیریت خطای کامل.
   * هرگز throw نمی‌کند، بلکه FetchedPage با status: 'failed' برمی‌گرداند.
   */
  private async fetchSingle(result: WebSearchRawResult): Promise<FetchedPage> {
    try {
      const response = await axios.get(result.link, {
        timeout: SEARCH_CONFIG.FETCH_TIMEOUT_MS,
        headers: {
          'User-Agent': SEARCH_CONFIG.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        responseType: 'text',
        // اجازه دادن به status code های غیر 200 برای مدیریت دستی
        validateStatus: () => true,
        maxRedirects: 5,
      });

      if (response.status < 200 || response.status >= 300) {
        logger.warn('Page fetch returned non-success status', {
          url: result.link,
          status: response.status,
        });
        return {
          url: result.link,
          title: result.title,
          status: 'failed',
          errorReason: `HTTP ${response.status}`,
        };
      }

      const html = typeof response.data === 'string' 
        ? response.data 
        : String(response.data);

      if (!html || html.length < 100) {
        return {
          url: result.link,
          title: result.title,
          status: 'failed',
          errorReason: 'Empty or too small response',
        };
      }

      return {
        url: result.link,
        title: result.title,
        status: 'success',
        html,
      };

    } catch (error: unknown) {
      let reason = 'Unknown error';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          reason = 'Timeout';
        } else if (error.code === 'ENOTFOUND') {
          reason = 'DNS resolution failed';
        } else if (error.code === 'ECONNREFUSED') {
          reason = 'Connection refused';
        } else {
          reason = error.message;
        }
      } else if (error instanceof Error) {
        reason = error.message;
      }

      logger.warn('Page fetch failed', {
        url: result.link,
        error: reason,
      });

      return {
        url: result.link,
        title: result.title,
        status: 'failed',
        errorReason: reason,
      };
    }
  }
}