# NAABU

## این ابزار چیست؟

Naabu یک ابزار از ProjectDiscovery برای **Port Scanning و Port Enumeration** است.

با Naabu می‌توان:

* پورت‌های باز Host و IP را شناسایی کرد.
* پورت‌های TCP و UDP را بررسی کرد.
* یک یا چند Host را هم‌زمان Scan کرد.
* پورت‌های مشخص یا محدوده‌ای از پورت‌ها را Scan کرد.
* Service Version را شناسایی کرد.
* خروجی را برای ابزارهایی مانند HTTPX ارسال کرد.

## نحوه استفاده

### نصب وابستگی

```bash
sudo apt install -y libpcap-dev
```

### نصب

```bash
go install -v github.com/projectdiscovery/naabu/v2/cmd/naabu@latest
```

### بررسی نصب

```bash
naabu -version
```

### Scan یک Host

```bash
naabu -host example.com
```

### Scan چند Host

```bash
naabu -list hosts.txt
```

### Scan پورت‌های مشخص

```bash
naabu -host example.com -p 80,443,8080
```

### Scan محدوده پورت‌ها

```bash
naabu -host example.com -p 1-1000
```

### Scan تمام پورت‌ها

```bash
naabu -host example.com -p -
```

### Scan پورت‌های رایج

```bash
naabu -host example.com -top-ports 100
```

### Scan پورت UDP

```bash
naabu -host example.com -p u:53
```

### نمایش فقط پورت‌های باز

```bash
naabu -host example.com -silent
```

### تعیین سرعت Scan

```bash
naabu -host example.com -rate 1000
```

### Service Version Detection

```bash
naabu -host example.com -sV
```

### ذخیره خروجی

```bash
naabu -host example.com -o results.txt
```

### خروجی JSON

```bash
naabu -host example.com -json -o results.json
```

### استفاده از stdin

```bash
cat hosts.txt | naabu -p 80,443
```

### استفاده در Pipeline با HTTPX

```bash
cat hosts.txt | naabu -silent | httpx -silent
```

### Scan تمام IPهای مرتبط با Host

```bash
naabu -host example.com -scan-all-ips
```

### حذف پورت‌های مشخص

```bash
naabu -host example.com -p - -exclude-ports 80,443
```
