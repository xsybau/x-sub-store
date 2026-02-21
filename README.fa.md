# انتخاب زبان مستندات: [English](README.md) | [فارسی](README.fa.md) | [Русский](README.ru.md) | [中文](README.zh.md)

# X-SUB-Store

X-SUB-Store یک سامانه امن و Docker-first برای تجمیع و مدیریت اشتراک‌های V2Ray است.

## ویژگی‌ها

- **هاب متمرکز**: چندین اشتراک (Hiddify، Xray و ...) را در یک خروجی واحد ادغام می‌کند.
- **پنل مدیریت**: مدیریت کاربران، تگ‌ها، منابع بالادستی (upstream) و نودهای ثابت.
- **تحویل مبتنی بر تگ**: چند تگ برای هر کاربر، تگ پیش‌فرض برای کاربران جدید، و اتصال منابع به تگ‌ها.
- **تجربه عملیاتی**: کپی سریع URL اشتراک کاربران و تست upstream با وضعیت لحظه‌ای.
- **امنیت**: توکن محرمانه برای هر کاربر، بدون ثبت‌نام عمومی، و ذخیره‌سازی رمزنگاری‌شده توکن‌ها.
- **کارایی**: کش، واکشی هم‌زمان و حذف موارد تکراری.
- **Docker-first**: استقرار ساده با Nginx و خودکارسازی SSL.

## بین‌المللی‌سازی رابط کاربری (i18n)

- زبان‌های UI: `en` (پیش‌فرض)، `fa`، `ru`، `zh`
- مسیرها بدون پیشوند زبان هستند (مثل `/admin/...`).
- سوییچر زبان در این بخش‌ها وجود دارد:
  - سایدبار پنل ادمین
  - صفحه ورود ادمین
- در زبان فارسی، رابط به‌صورت `RTL` با رفتار آینه‌ای شل ادمین اعمال می‌شود.
- در این فاز فقط متن‌های UI ترجمه شده‌اند و پیام‌های API/بک‌اند ترجمه نمی‌شوند.

## ساختار Nuxt 4 (App Directory)

- پوشه‌های اپلیکیشن Nuxt داخل `app/` قرار دارند:
  - `app/pages`، `app/layouts`، `app/components`، `app/composables`، `app/middleware`، `app/plugins`، `app/assets`
- مرزهای دامنه/بک‌اند در ریشه پروژه باقی می‌مانند:
  - `modules/`، `i18n/`، `server/`، `scripts/`، `tests/`، `public/`
- ایمپورت‌های ریشه همچنان معتبرند:
  - `~/modules/*`، `~/i18n/*`، `~/server/*`

## شروع سریع (Dev)

1. ریپو را clone کنید.
2. فایل `.env.example` را به `.env` کپی و ویرایش کنید:
   ```bash
   cp .env.example .env
   ```
3. استک توسعه را بالا بیاورید:
   ```bash
   docker compose -f compose.dev.yml up -d
   ```
4. داخل کانتینر سرویس `app`، dev server را به‌صورت دستی اجرا کنید:
   ```bash
   docker compose -f compose.dev.yml exec app bun run dev --host 0.0.0.0 --port 3000
   ```
5. یک کاربر ادمین بسازید (در ترمینال جدا):
   ```bash
   docker compose -f compose.dev.yml exec app bun run scripts/create-admin.ts --email admin@example.com --password secret
   ```
6. دسترسی:
   - `https://localhost/admin`
   - `http://localhost:3000/admin`
   - `http://localhost/subs/<token>`

## HTTPS محلی (مشابه استقرار)

```bash
docker compose -f compose.dev.yml up -d
```

این استک شامل سرویس‌های `traefik`، `app` و `mongo` است.
`DEV_DOMAIN` به‌صورت پیش‌فرض `localhost` است.

نکات:
- Traefik برای `https://localhost` به‌صورت خودکار گواهی self-signed توسعه ایجاد می‌کند و ممکن است در کلاینت‌ها با خطای `UntrustedRoot` دیده شود.
- برای ایمپورت اشتراک محلی از `http://localhost/subs/<token>` استفاده کنید یا `NUXT_PUBLIC_SUBSCRIPTION_BASE_URL=http://localhost` بگذارید.

## استقرار Production

1. مقادیر `DOMAIN` و `EMAIL` را در `.env` تنظیم کنید.
2. گواهی‌های SSL را مقداردهی اولیه کنید:
   ```bash
   chmod +x ops/ssl/init.sh
   ./ops/ssl/init.sh
   ```
3. استک production را بسازید و اجرا کنید:
   ```bash
   docker compose -f compose.yml up -d --build
   ```
4. برای ری‌استارت عادی بدون build:
   ```bash
   docker compose -f compose.yml up -d
   ```
5. داده‌های MongoDB در volume نام‌دار Docker پایدار می‌مانند.

## مدیریت

### مدیریت کاربران

- وارد پنل مدیریت شوید.
- کاربر بسازید؛ هر کاربر یک URL اشتراک یکتا دریافت می‌کند.
- برای هر کاربر تگ تعیین کنید (چندتگ پشتیبانی می‌شود).
- با گزینه "Copy Subscription URL" در لیست کاربران، لینک اشتراک را سریع کپی کنید.
- خروجی اشتراک به‌صورت پیش‌فرض raw URL است و با کلاینت‌های رایج سازگار است.
- در صورت نیاز، `?format=base64` به URL اضافه کنید.

### مدیریت Upstream

- **Global**: برای همه کاربران.
- **User**: فقط برای یک کاربر.
- **Tag**: برای کاربران دارای یک تگ مشخص.
- پشتیبانی از لیست متنی خام و لینک اشتراک base64.
- گزینه "Test Fetch" وضعیت و زمان آخرین بررسی را به‌روزرسانی می‌کند.

### مدیریت تگ‌ها

- ایجاد، ویرایش و حذف تگ.
- تعریف چند تگ پیش‌فرض برای کاربران جدید.
- مدیریت upstream و static node در سطح تگ.
- اعمال تگ روی کاربران انتخاب‌شده یا همه کاربران.
- اجرای عملیات گروهی روی کاربران یک تگ:
  - غیرفعال‌سازی حساب
  - چرخش توکن
  - حذف کاربران

### چرخش توکن

- در جزئیات کاربر، گزینه "Rotate Token" توکن قدیمی را بی‌اعتبار و توکن جدید ایجاد می‌کند.

## توسعه

روال پیشنهادی، اجرای دستورات داخل کانتینر سرویس `app` است:

- lint + typecheck:
  ```bash
  docker compose -f compose.dev.yml exec app bun run lint
  ```
- lint کامل بدون کش:
  ```bash
  docker compose -f compose.dev.yml exec app bun run lint:full
  ```
- build:
  ```bash
  docker compose -f compose.dev.yml exec app bun run build
  ```
- test:
  ```bash
  docker compose -f compose.dev.yml exec app bun test
  ```

## معماری

- **بک‌اند**: Nuxt 4 (Nitro)
- **دیتابیس**: MongoDB (Mongoose)
- **فرانت‌اند**: Nuxt UI (Tailwind)
- **Runtime**: Bun
- **امنیت**: هش Argon2، رمزنگاری توکن با AES-256-GCM و نشست‌های H3
