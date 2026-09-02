# SUBFINDER

## این ابزار چیست؟

Subfinder یک ابزار از ProjectDiscovery برای **Passive Subdomain Enumeration** است.

با Subfinder می‌توان:

* Subdomainهای یک Domain را از منابع عمومی پیدا کرد.
* از چندین منبع داده برای جمع‌آوری Subdomain استفاده کرد.
* Subdomainهای پیدا‌شده را به صورت لیست خروجی گرفت.
* خروجی را مستقیماً به ابزارهایی مانند DNSX و HTTPX منتقل کرد.

## نحوه استفاده

### نصب

```bash
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
```

### بررسی نصب

```bash
subfinder -version
```

### پیدا کردن Subdomainهای یک Domain

```bash
subfinder -d example.com
```

### نمایش فقط Subdomainها

```bash
subfinder -d example.com -silent
```

### پیدا کردن Subdomain از یک لیست Domain

```bash
subfinder -dL domains.txt
```

### استفاده از stdin

```bash
cat domains.txt | subfinder
```

### ذخیره خروجی

```bash
subfinder -d example.com -silent -o subdomains.txt
```

### نمایش منابع پیدا کردن Subdomain

```bash
subfinder -d example.com -v
```

### استفاده از منابع مشخص

```bash
subfinder -d example.com -sources crtsh,github
```

### حذف منابع مشخص

```bash
subfinder -d example.com -es github
```

### خروجی JSON

```bash
subfinder -d example.com -json -o results.json
```

### استفاده در Pipeline با DNSX

```bash
subfinder -d example.com -silent | dnsx -silent
```

### استفاده در Pipeline با HTTPX

```bash
subfinder -d example.com -silent | dnsx -silent | httpx -silent
```
