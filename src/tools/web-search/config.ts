export const SEARCH_CONFIG = {
  // محدودیت تعداد صفحات
  MAX_RESULTS: 5,
  MIN_RESULTS: 1,

  // محدودیت‌های حجمی برای جلوگیری از طغیان Context
  MAX_PAGE_TEXT_CHARS: 8000,      // حداکثر کاراکتر متن برای هر صفحه
  MAX_TOTAL_TEXT_CHARS: 20000,    // حداکثر کاراکتر متن مجموع همه صفحات
  MAX_CODE_BLOCKS: 10,            // حداکثر تعداد بلوک‌های کد در کل خروجی
  MAX_CODE_CHARS: 5000,           // حداکثر کاراکتر کد در کل خروجی

  // تنظیمات شبکه
  FETCH_TIMEOUT_MS: 10000,        // 10 ثانیه تایم‌اوت برای هر درخواست
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};