# DALFOX

## این ابزار چیست؟

Dalfox یک ابزار سریع و قابل تنظیم برای **XSS Scanning و Parameter Analysis** است.

با Dalfox می‌توان:

* پارامترهای URL را برای XSS بررسی کرد.
* Reflected XSS را شناسایی کرد.
* DOM-based XSS را بررسی کرد.
* URLها و Endpointهای دارای Parameter را Scan کرد.
* از فایل یا stdin برای دریافت Target استفاده کرد.
* نتایج Scan را در فایل ذخیره کرد.

## نحوه استفاده

### نصب

```bash
go install github.com/hahwul/dalfox/v2@latest
```

### بررسی نصب

```bash
dalfox version
```

### بررسی یک URL

```bash
dalfox url "https://example.com/search?q=test"
```

### استفاده از لیست URL

```bash
dalfox file urls.txt
```

### استفاده از stdin

```bash
cat urls.txt | dalfox pipe
```

### بررسی یک Parameter مشخص

```bash
dalfox url "https://example.com/search?q=test"
```

### استفاده از Cookie

```bash
dalfox url "https://example.com/search?q=test" \
    --cookie "session=VALUE"
```

### استفاده از Header

```bash
dalfox url "https://example.com/search?q=test" \
    --header "Authorization: Bearer TOKEN"
```

### استفاده از Wordlist

```bash
dalfox url "https://example.com/search?q=test" \
    --custom-payload payloads.txt
```

### Scan عمیق‌تر

```bash
dalfox url "https://example.com/search?q=test" \
    --deep-domxss
```

### ذخیره خروجی

```bash
dalfox url "https://example.com/search?q=test" \
    --output results.txt
```

### خروجی JSON

```bash
dalfox url "https://example.com/search?q=test" \
    --format json \
    --output results.json
```

### استفاده در Pipeline

```bash
cat urls.txt | dalfox pipe
```

### Pipeline با Katana

```bash
katana -u https://example.com -silent | dalfox pipe
```
