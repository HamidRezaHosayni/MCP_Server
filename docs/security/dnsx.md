# DNSX

## این ابزار چیست؟

DNSX یک ابزار از ProjectDiscovery برای **DNS Resolution و DNS Enumeration** است.

با DNSX می‌توان:

* Domain و Subdomainها را Resolve کرد.
* IP آدرس‌های A و AAAA را پیدا کرد.
* رکوردهای DNS مانند CNAME، MX، NS، TXT و CAA را بررسی کرد.
* DNS Brute Force انجام داد.
* Wildcard DNS را شناسایی و فیلتر کرد.

## نحوه استفاده

### نصب

```bash
go install -v github.com/projectdiscovery/dnsx/cmd/dnsx@latest
```

### بررسی نصب

```bash
dnsx -version
```

### Resolve کردن یک لیست

```bash
dnsx -l subdomains.txt -silent
```

### استفاده از stdin

```bash
cat subdomains.txt | dnsx -silent
```

### نمایش IP آدرس

```bash
dnsx -l subdomains.txt -a -resp
```

### بررسی رکوردهای DNS

```bash
dnsx -l domains.txt -a
dnsx -l domains.txt -aaaa
dnsx -l domains.txt -cname
dnsx -l domains.txt -mx
dnsx -l domains.txt -ns
dnsx -l domains.txt -txt
```

### DNS Brute Force

```bash
dnsx -d example.com -w wordlist.txt -silent
```

### استفاده از Resolver اختصاصی

```bash
dnsx -l subdomains.txt -r resolvers.txt
```

### Wildcard Filtering

```bash
dnsx -l subdomains.txt -wd example.com
```

### ذخیره خروجی

```bash
dnsx -l subdomains.txt -silent -o resolved.txt
```

### خروجی JSON

```bash
dnsx -l subdomains.txt -json -o results.json
```

### استفاده در Pipeline

```bash
subfinder -d example.com -silent | dnsx -silent
```
