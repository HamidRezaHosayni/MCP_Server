# NIKTO

## این ابزار چیست؟

Nikto یک ابزار برای **Web Server Scanning و Security Testing** است.

با Nikto می‌توان:

* Web Server را برای مشکلات امنیتی شناخته‌شده بررسی کرد.
* فایل‌ها و صفحات پیش‌فرض یا خطرناک را پیدا کرد.
* Misconfigurationهای Web Server را شناسایی کرد.
* نسخه‌های قدیمی نرم‌افزارها را شناسایی کرد.
* CGIها و منابع رایج و ناامن را بررسی کرد.
* نتیجه Scan را در فرمت‌های مختلف ذخیره کرد.

## نحوه استفاده

### نصب

```bash
sudo apt install nikto
```

### بررسی نصب

```bash
nikto -Version
```

### Scan یک وب‌سایت

```bash
nikto -h https://example.com
```

### Scan یک Host با پورت مشخص

```bash
nikto -h example.com -port 8080
```

### Scan چند پورت

```bash
nikto -h example.com -port 80,443,8080
```

### Scan لیست Targetها

```bash
nikto -h targets.txt
```

### استفاده از SSL

```bash
nikto -h example.com -port 443 -ssl
```

### دنبال کردن Redirectها

```bash
nikto -h https://example.com -followredirects
```

### نمایش اطلاعات بیشتر

```bash
nikto -h https://example.com -Display V
```

### مشخص کردن Header

```bash
nikto -h https://example.com \
    -Add-header "Authorization: Bearer TOKEN"
```

### استفاده از Basic Authentication

```bash
nikto -h https://example.com \
    -id username:password
```

### محدود کردن نوع تست‌ها

```bash
nikto -h https://example.com -Tuning 123b
```

### تعیین Timeout

```bash
nikto -h https://example.com -timeout 10
```

### ذخیره خروجی

```bash
nikto -h https://example.com -output results.txt
```

### ذخیره خروجی JSON

```bash
nikto -h https://example.com \
    -output results.json \
    -Format json
```

### ذخیره خروجی HTML

```bash
nikto -h https://example.com \
    -output results.html \
    -Format htm
```

### استفاده از Proxy

```bash
nikto -h https://example.com -useproxy
```

### نمایش Pluginهای موجود

```bash
nikto -list-plugins
```

### اجرای Plugin مشخص

```bash
nikto -h https://example.com -Plugins "plugin_name"
```
