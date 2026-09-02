# KATANA

## این ابزار چیست؟

Katana یک ابزار سریع و قابل تنظیم از ProjectDiscovery برای **Web Crawling و Endpoint Discovery** است.

با Katana می‌توان:

* صفحات و لینک‌های یک وب‌سایت را Crawl کرد.
* Endpointها و URLهای موجود در برنامه وب را پیدا کرد.
* لینک‌های داخل HTML و JavaScript را استخراج کرد.
* فرم‌ها و منابع مرتبط با صفحات را شناسایی کرد.
* JavaScript را برای پیدا کردن Endpointهای بیشتر بررسی کرد.
* خروجی Crawl را برای ابزارهای دیگر آماده کرد.

## نحوه استفاده

### نصب

```bash
go install github.com/projectdiscovery/katana/cmd/katana@latest
```

### بررسی نصب

```bash
katana -version
```

### Crawl کردن یک URL

```bash
katana -u https://example.com
```

### Crawl کردن یک لیست URL

```bash
katana -list urls.txt
```

### استفاده از stdin

```bash
cat urls.txt | katana
```

### Crawl با عمق مشخص

```bash
katana -u https://example.com -d 3
```

### نمایش فقط URLها

```bash
katana -u https://example.com -silent
```

### Crawl کردن JavaScript

```bash
katana -u https://example.com -js-crawl
```

### استخراج Endpointها از JavaScript

```bash
katana -u https://example.com -js-crawl -jsluice
```

### استخراج فرم‌ها

```bash
katana -u https://example.com -form-extraction
```

### استفاده از Headless Browser

```bash
katana -u https://example.com -headless
```

### ذخیره خروجی

```bash
katana -u https://example.com -silent -o urls.txt
```

### خروجی JSON

```bash
katana -u https://example.com -jsonl -o results.json
```

### محدود کردن Scope به یک Domain

```bash
katana -u https://example.com -fs fqdn
```

### استفاده در Pipeline

```bash
cat live.txt | katana -silent
```

### Pipeline با HTTPX

```bash
subfinder -d example.com -silent | dnsx -silent | httpx -silent | katana -silent
```
