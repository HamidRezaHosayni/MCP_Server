# FFUF

## این ابزار چیست؟

FFUF یک ابزار سریع برای **Web Fuzzing** است.

با FFUF می‌توان:

* مسیرها و Directoryهای مخفی را پیدا کرد.
* فایل‌ها و Endpointهای موجود را شناسایی کرد.
* پارامترهای HTTP را Fuzz کرد.
* Virtual Hostها را بررسی کرد.
* درخواست‌های GET و POST را Fuzz کرد.
* نتایج را بر اساس Status Code، اندازه پاسخ و سایر معیارها فیلتر کرد.

## نحوه استفاده

### نصب

```bash
go install github.com/ffuf/ffuf/v2@latest
```

### بررسی نصب

```bash
ffuf -V
```

### پیدا کردن Directory و Endpoint

```bash
ffuf -u https://example.com/FUZZ -w wordlist.txt
```

### پیدا کردن فایل‌ها

```bash
ffuf -u https://example.com/FUZZ -w wordlist.txt -e .php,.html,.txt
```

### Fuzz کردن پارامتر GET

```bash
ffuf -u "https://example.com/page?FUZZ=test" -w wordlist.txt
```

### Fuzz کردن مقدار پارامتر

```bash
ffuf -u "https://example.com/page?id=FUZZ" -w wordlist.txt
```

### Fuzz کردن درخواست POST

```bash
ffuf -u https://example.com/login \
     -X POST \
     -d "username=FUZZ&password=test" \
     -w wordlist.txt
```

### فیلتر کردن Status Code

```bash
ffuf -u https://example.com/FUZZ -w wordlist.txt -fc 404
```

### فیلتر کردن اندازه پاسخ

```bash
ffuf -u https://example.com/FUZZ -w wordlist.txt -fs 1234
```

### مشخص کردن Header

```bash
ffuf -u https://example.com/FUZZ \
     -w wordlist.txt \
     -H "Authorization: Bearer TOKEN"
```

### ذخیره خروجی

```bash
ffuf -u https://example.com/FUZZ \
     -w wordlist.txt \
     -o results.json \
     -of json
```

### استفاده در Pipeline

```bash
cat live.txt | while read url; do
    ffuf -u "$url/FUZZ" -w wordlist.txt -silent
done
```
