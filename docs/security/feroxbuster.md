# FERoxBUSTER

## این ابزار چیست؟

Feroxbuster یک ابزار سریع برای **Content Discovery و Web Fuzzing** است.

با Feroxbuster می‌توان:

* Directoryها و فایل‌های مخفی را پیدا کرد.
* Endpointها و Resourceهای موجود در وب‌سایت را شناسایی کرد.
* فایل‌ها را با Extensionهای مختلف بررسی کرد.
* با استفاده از Wordlist مسیرهای مختلف را Fuzz کرد.
* لینک‌های پیدا‌شده را به صورت Recursive دنبال کرد.
* نتایج را در فایل ذخیره کرد.

## نحوه استفاده

### نصب

```bash
sudo apt install feroxbuster
```

### بررسی نصب

```bash
feroxbuster --version
```

### پیدا کردن Directory و فایل

```bash
feroxbuster -u https://example.com -w wordlist.txt
```

### استفاده از Extension

```bash
feroxbuster -u https://example.com -w wordlist.txt -x php,html,txt
```

### Recursive Scan

```bash
feroxbuster -u https://example.com -w wordlist.txt -r
```

### استفاده از چند Thread

```bash
feroxbuster -u https://example.com -w wordlist.txt -t 50
```

### فیلتر کردن Status Code

```bash
feroxbuster -u https://example.com -w wordlist.txt -s 200,204,301,302
```

### حذف Status Code

```bash
feroxbuster -u https://example.com -w wordlist.txt -C 404
```

### استفاده از Header

```bash
feroxbuster -u https://example.com \
    -w wordlist.txt \
    -H "Authorization: Bearer TOKEN"
```

### استفاده از Cookie

```bash
feroxbuster -u https://example.com \
    -w wordlist.txt \
    -H "Cookie: session=VALUE"
```

### ذخیره خروجی

```bash
feroxbuster -u https://example.com \
    -w wordlist.txt \
    -o results.txt
```

### استفاده از Proxy

```bash
feroxbuster -u https://example.com \
    -w wordlist.txt \
    -p http://127.0.0.1:8080
```

### استفاده در Pipeline

```bash
cat live.txt | while read url; do
    feroxbuster -u "$url" -w wordlist.txt
done
```

### Pipeline با HTTPX

```bash
cat subdomains.txt | httpx -silent | while read url; do
    feroxbuster -u "$url" -w wordlist.txt
done
```
