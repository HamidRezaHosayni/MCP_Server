import axios from 'axios';
import { WebSearchRawResult } from './types.js';
import { SEARCH_CONFIG } from './config.js';
import { logger } from '../../logger/JsonLogger.js';

// لیست سرورهای عمومی SearXNG. اگر یکی فیلتر بود، بعدی امتحان می‌شود.
const SEARXNG_INSTANCES = [
  'https://searx.be',
  'https://search.sapti.me',
  'https://searx.fmac.xyz',
  'https://search.ononoki.org'
];

export class WebSearchProvider {
  constructor() {
    logger.info('WebSearchProvider initialized (SearXNG - Free, No API Key, Fallback Support)');
  }

  public async search(query: string, numResults: number): Promise<WebSearchRawResult[]> {
    const safeNum = Math.min(
      Math.max(numResults, SEARCH_CONFIG.MIN_RESULTS),
      SEARCH_CONFIG.MAX_RESULTS
    );

    // امتحان کردن سرورها به ترتیب تا زمانی که یکی جواب دهد
    for (const instance of SEARXNG_INSTANCES) {
      try {
        logger.info(`Attempting SearXNG search via ${instance}`, { query, requestedResults: safeNum });

        const response = await axios.get(`${instance}/search`, {
          params: {
            q: query,
            format: 'json',
            categories: 'general',
            safesearch: 0
          },
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          },
          timeout: 8000 // 8 ثانیه زمان انتظار برای هر سرور
        });

        const results = response.data.results || [];
        
        if (results.length > 0) {
          const mappedResults: WebSearchRawResult[] = results.slice(0, safeNum).map((item: any) => ({
            title: item.title || 'No Title',
            link: item.url,
            snippet: item.content || ''
          }));

          logger.info('SearXNG search completed successfully', {
            instance,
            query,
            returned: mappedResults.length
          });

          return mappedResults;
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.warn(`SearXNG instance ${instance} failed, trying next...`, { error: message, query });
        // ادامه حلقه برای امتحان سرور بعدی
      }
    }

    // اگر تمام سرورها شکست خوردند
    throw new Error('❌ Web search failed: All search instances were unreachable. This is likely due to network restrictions. Please check your internet connection or try a different query.');
  }
}