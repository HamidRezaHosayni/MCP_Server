# SQLMAP

## این ابزار چیست؟

SQLMap یک ابزار برای **SQL Injection Detection و Exploitation** است.

با SQLMap می‌توان:

* پارامترهای HTTP را برای SQL Injection بررسی کرد.
* انواع مختلف SQL Injection را شناسایی کرد.
* Database، Table و Columnهای قابل دسترسی را Enumeration کرد.
* اطلاعات Database را در صورت داشتن مجوز استخراج کرد.
* درخواست‌های GET و POST را بررسی کرد.
* Requestهای ذخیره‌شده در فایل را آزمایش کرد.
* خروجی Scan را در فایل ذخیره کرد.

## نحوه استفاده

### نصب

```bash
sudo apt install sqlmap
```

### بررسی نصب

```bash
sqlmap --version
```

### بررسی یک URL

```bash
sqlmap -u "https://example.com/page?id=1"
```

### بررسی Parameter مشخص

```bash
sqlmap -u "https://example.com/page?id=1" -p id
```

### بررسی POST Request

```bash
sqlmap -u "https://example.com/login" \
    --data="username=test&password=test"
```

### استفاده از Request ذخیره‌شده

```bash
sqlmap -r request.txt
```

### بررسی Databaseها

```bash
sqlmap -u "https://example.com/page?id=1" --dbs
```

### نمایش Tableهای یک Database

```bash
sqlmap -u "https://example.com/page?id=1" \
    -D database_name --tables
```

### نمایش Columnهای یک Table

```bash
sqlmap -u "https://example.com/page?id=1" \
    -D database_name -T table_name --columns
```

### استخراج داده از Table

```bash
sqlmap -u "https://example.com/page?id=1" \
    -D database_name -T table_name --dump
```

### بررسی سطح و Techniqueهای بیشتر

```bash
sqlmap -u "https://example.com/page?id=1" \
    --level=3 --risk=2
```

### استفاده از Cookie

```bash
sqlmap -u "https://example.com/page?id=1" \
    --cookie="session=VALUE"
```

### ذخیره خروجی

```bash
sqlmap -u "https://example.com/page?id=1" \
    --output-dir=results
```

### استفاده در Pipeline

```bash
cat urls.txt | while read url; do
    sqlmap -u "$url" --batch
done
```
