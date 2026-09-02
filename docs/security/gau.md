# GAU

## این ابزار چیست؟

GAU (GetAllURLs) یک ابزار برای **جمع‌آوری URLهای شناخته‌شده و تاریخی یک Domain** از منابع عمومی مانند Wayback Machine، Common Crawl، AlienVault OTX و URLScan است.

با GAU می‌توان:

* URLهای قدیمی و شناخته‌شده یک Domain را پیدا کرد.
* Endpointها و URLهای دارای Parameter را جمع‌آوری کرد.
* URLهای مربوط به Subdomainها را نیز دریافت کرد.
* URLها را بر اساس Extension، Status Code یا MIME Type فیلتر کرد.
* خروجی را برای ابزارهایی مانند Katana، HTTPX و Dalfox آماده کرد.

## نحوه استفاده

### نصب

```bash
go install github.com/lc/gau/v2/cmd/gau@latest
```

### بررسی نصب

```bash
gau --version
```

### دریافت URLهای یک Domain

```bash
gau example.com
```

### دریافت URLهای چند Domain

```bash
gau example.com example.org
```

### استفاده از stdin

```bash
cat domains.txt | gau
```

### دریافت URLهای Subdomainها

```bash
gau --subs example.com
```

### حذف Extensionهای مشخص

```bash
gau --blacklist png,jpg,gif example.com
```

### حذف URLهای دارای Status Code مشخص

```bash
gau --fc 404,302 example.com
```

### فقط URLهای دارای Status Code مشخص

```bash
gau --mc 200,500 example.com
```

### حذف URLهای تکراری بر اساس Parameter

```bash
gau --fp example.com
```

### انتخاب Providerهای مشخص

```bash
gau --providers wayback,commoncrawl example.com
```

### تعیین بازه زمانی

```bash
gau --from 202101 --to 202601 example.com
```

### تعیین تعداد Thread

```bash
gau --threads 5 example.com
```

### ذخیره خروجی

```bash
gau --o urls.txt example.com
```

### خروجی JSON

```bash
gau --json example.com
```

### استفاده از Proxy

```bash
gau --proxy http://127.0.0.1:8080 example.com
```

### استفاده در Pipeline

```bash
subfinder -d example.com -silent | gau
```

### استفاده برای پیدا کردن URLهای دارای Parameter

```bash
gau example.com | grep "="
```
