# HTTPX

## این ابزار چیست؟

HTTPX یک ابزار از ProjectDiscovery برای **HTTP/HTTPS Probing و Web Service Discovery** است.

با HTTPX می‌توان:

* بررسی کرد کدام Domain و Subdomain سرویس HTTP/HTTPS فعال دارند.
* Status Code و Page Title را دریافت کرد.
* Technologyهای استفاده‌شده در Web Server را شناسایی کرد.
* Web Server و اطلاعات HTTP را بررسی کرد.
* Redirectها و URLهای فعال را شناسایی کرد.

## نحوه استفاده

### نصب

```bash
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
```

### بررسی نصب

```bash
httpx -version
```

### بررسی یک URL

```bash
httpx -u https://example.com
```

### بررسی یک لیست

```bash
httpx -l subdomains.txt
```

### استفاده از stdin

```bash
cat subdomains.txt | httpx
```

### نمایش Status Code

```bash
httpx -l subdomains.txt -status-code
```

### نمایش Title

```bash
httpx -l subdomains.txt -title
```

### شناسایی Technology

```bash
httpx -l subdomains.txt -tech-detect
```

### نمایش Web Server

```bash
httpx -l subdomains.txt -web-server
```

### نمایش Redirect

```bash
httpx -l subdomains.txt -location
```

### نمایش اطلاعات کامل HTTP

```bash
httpx -l subdomains.txt -status-code -title -tech-detect -web-server
```

### فقط نمایش URLهای فعال

```bash
httpx -l subdomains.txt -silent
```

### ذخیره خروجی

```bash
httpx -l subdomains.txt -silent -o live.txt
```

### خروجی JSON

```bash
httpx -l subdomains.txt -json -o results.json
```

### استفاده در Pipeline

```bash
subfinder -d example.com -silent | dnsx -silent | httpx -silent
```
