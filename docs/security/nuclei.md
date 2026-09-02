# NUCLEI

## این ابزار چیست؟

Nuclei یک ابزار از ProjectDiscovery برای **Vulnerability Scanning و Security Testing** است.

با Nuclei می‌توان:

* آسیب‌پذیری‌ها و misconfigurationهای شناخته‌شده را شناسایی کرد.
* Targetهای HTTP/HTTPS را با Templateهای امنیتی بررسی کرد.
* سرویس‌ها، تکنولوژی‌ها و Endpointهای شناسایی‌شده را بررسی کرد.
* Templateهای مشخص یا مجموعه‌ای از Templateها را اجرا کرد.
* نتایج Scan را در قالب‌های مختلف ذخیره کرد.

## نحوه استفاده

### نصب

```bash
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
```

### بررسی نصب

```bash
nuclei -version
```

### Scan کردن یک URL

```bash
nuclei -u https://example.com
```

### Scan کردن یک لیست URL

```bash
nuclei -l urls.txt
```

### استفاده از stdin

```bash
cat urls.txt | nuclei
```

### اجرای یک Template مشخص

```bash
nuclei -u https://example.com -t http/cves/
```

### اجرای Template بر اساس Tag

```bash
nuclei -u https://example.com -tags cve
```

### اجرای Template بر اساس Severity

```bash
nuclei -u https://example.com -severity critical,high
```

### نمایش Templateهای قابل اجرا

```bash
nuclei -tl
```

### به‌روزرسانی Templateها

```bash
nuclei -update-templates
```

### نمایش نتایج به صورت خلاصه

```bash
nuclei -u https://example.com -silent
```

### ذخیره خروجی

```bash
nuclei -l urls.txt -o results.txt
```

### خروجی JSONL

```bash
nuclei -l urls.txt -jsonl-export results.jsonl
```

### استفاده در Pipeline

```bash
cat live.txt | nuclei -silent
```

### Pipeline با Katana

```bash
cat live.txt | katana -silent | nuclei -silent
```
