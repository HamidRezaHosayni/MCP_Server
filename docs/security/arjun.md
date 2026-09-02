# ARJUN

## این ابزار چیست؟

Arjun یک ابزار برای **HTTP Parameter Discovery** است.

با Arjun می‌توان:

* پارامترهای مخفی GET و POST را پیدا کرد.
* پارامترهای Endpointهای وب و API را شناسایی کرد.
* درخواست‌های GET، POST، JSON و XML را بررسی کرد.
* از Wordlist اختصاصی برای پیدا کردن Parameterها استفاده کرد.
* نتایج را در فایل Text یا JSON ذخیره کرد.
* Targetها را از فایل یا ورودی‌های دیگر دریافت کرد.

## نحوه استفاده

### نصب

```bash
pipx install arjun
```

### بررسی نصب

```bash
arjun --help
```

### پیدا کردن پارامترهای یک URL

```bash
arjun -u https://example.com/page
```

### بررسی پارامترهای POST

```bash
arjun -u https://example.com/page -m POST
```

### بررسی پارامترهای JSON

```bash
arjun -u https://example.com/api -m JSON
```

### بررسی پارامترهای XML

```bash
arjun -u https://example.com/api -m XML
```

### استفاده از Wordlist اختصاصی

```bash
arjun -u https://example.com/page -w params.txt
```

### استفاده از Header اختصاصی

```bash
arjun -u https://example.com/page -H "Authorization: Bearer TOKEN"
```

### وارد کردن چند Target

```bash
arjun -i urls.txt
```

### ذخیره خروجی متنی

```bash
arjun -u https://example.com/page -oT results.txt
```

### ذخیره خروجی JSON

```bash
arjun -u https://example.com/page -oJ results.json
```

### تعیین تعداد Thread

```bash
arjun -u https://example.com/page -t 10
```

### استفاده در Pipeline

```bash
cat urls.txt | while read url; do
    arjun -u "$url"
done
```
