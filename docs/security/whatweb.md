# WHATWEB

## این ابزار چیست؟

WhatWeb یک ابزار برای **Web Technology Fingerprinting** است.

با WhatWeb می‌توان:

* تکنولوژی‌های استفاده‌شده در یک وب‌سایت را شناسایی کرد.
* Web Server و CMS را تشخیص داد.
* Frameworkها و JavaScript Libraryها را شناسایی کرد.
* Version برخی تکنولوژی‌ها را شناسایی کرد.
* اطلاعاتی مانند Headerها، Cookieها و Redirectها را بررسی کرد.
* با استفاده از Pluginها، تکنولوژی‌های خاص را شناسایی کرد.

## نحوه استفاده

### نصب

```bash
sudo apt install whatweb
```

### بررسی نصب

```bash
whatweb --version
```

### بررسی یک وب‌سایت

```bash
whatweb https://example.com
```

### بررسی چند وب‌سایت

```bash
whatweb https://example.com https://test.com
```

### بررسی لیست وب‌سایت‌ها

```bash
whatweb -i targets.txt
```

### نمایش اطلاعات بیشتر

```bash
whatweb -v https://example.com
```

### اسکن با سطح Aggressive

```bash
whatweb -a 3 https://example.com
```

### مشخص کردن Header

```bash
whatweb -H "Authorization: Bearer TOKEN" https://example.com
```

### مشخص کردن User-Agent

```bash
whatweb -U "Mozilla/5.0" https://example.com
```

### بررسی Pluginها

```bash
whatweb -l
```

### مشاهده اطلاعات یک Plugin

```bash
whatweb -I WordPress
```

### انتخاب Plugin مشخص

```bash
whatweb -p WordPress https://example.com
```

### ذخیره خروجی JSON

```bash
whatweb --log-json=results.json https://example.com
```

### استفاده در Pipeline

```bash
cat live.txt | whatweb -i /dev/stdin
```
