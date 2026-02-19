# هاب اشتراک V2Ray

یک سامانه امن و Docker-first برای تجمیع و مدیریت اشتراک‌های V2Ray.

## ویژگی‌ها
- **هاب متمرکز**: چندین اشتراک (Hiddify، Xray و ...) را در یک خروجی واحد ادغام می‌کند.
- **پنل مدیریت**: مدیریت کاربران، منابع بالادستی (upstream) و نودهای ثابت.
- **امنیت**: توکن محرمانه برای هر کاربر، بدون ثبت‌نام عمومی، و ذخیره‌سازی رمزنگاری‌شده توکن‌ها.
- **کارایی**: کش، واکشی هم‌زمان و حذف موارد تکراری.
- **Docker-first**: استقرار ساده با Nginx و خودکارسازی SSL.

## شروع سریع (Dev)

1. ریپو را clone کنید.
2. فایل `.env.example` را به `.env` کپی و ویرایش کنید:
   ```bash
   cp .env.example .env
   ```
3. استک را بالا بیاورید (بار اول ایمیج ساخته می‌شود و دفعات بعد از همان استفاده می‌شود):
   ```bash
   docker compose -f compose.dev.yml up -d
   ```
4. سرور dev را داخل کانتینر `app` اجرا کنید:
   ```bash
   docker exec -it ss-app ash
   bun dev
   ```
5. یک کاربر ادمین بسازید (در یک ترمینال جدا):
   ```bash
   docker compose -f compose.dev.yml exec app bun run scripts/create-admin.ts --email admin@example.com --password secret
   ```
6. دسترسی:
   - `https://localhost/admin` (از طریق Nginx + گواهی‌های محلی)
   - `http://localhost:3000/admin` (اتصال مستقیم به Nuxt dev server)

## HTTPS محلی (مشابه استقرار)

از استک dev مستقل استفاده کنید:

```bash
docker compose -f compose.dev.yml up -d
```

این کار یک composition جداگانه dev (`app`، `mongo`، `nginx`) اجرا می‌کند و از گواهی‌های محلی `nginx/cert-local` استفاده می‌کند.
`DEV_DOMAIN` به‌صورت پیش‌فرض `localhost` است (در صورت نیاز override کنید، مثلا `DEV_DOMAIN=api.localhost`).
سورس Nuxt برای hot reload mount شده است. کش وابستگی‌ها، کش Nuxt/Nitro و داده‌های MongoDB در volumeهای نام‌دار Docker به‌صورت پایدار نگه‌داری می‌شوند.
سرور dev را به‌صورت دستی اجرا کنید:
```bash
docker exec -it ss-app ash
bun dev
```

دسترسی:
- `https://localhost/admin`

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
4. برای ری‌استارت‌های عادی، دوباره build نکنید:
   ```bash
   docker compose -f compose.yml up -d
   ```
5. داده‌های MongoDB در یک volume نام‌دار Docker پایدار می‌مانند.
6. برنامه در `https://your-domain.com` در دسترس خواهد بود.

## مدیریت

### مدیریت کاربران
- وارد پنل مدیریت شوید.
- کاربر ایجاد کنید. هر کاربر یک Subscription URL یکتا دریافت می‌کند.
- این URL را برای کلاینت V2Ray کاربر (مثل v2rayNG، V2Box و ...) ارسال کنید.

### مدیریت Upstreamها
- **Global**: برای تمام کاربران اعمال می‌شود.
- **User**: فقط برای کاربر مشخص اعمال می‌شود.
- از لیست‌های متنی خام یا لینک‌های اشتراک base64 پشتیبانی می‌کند.

### چرخش توکن
- در صفحه جزئیات کاربر، روی "Rotate Token" بزنید تا URL قبلی بلافاصله نامعتبر و URL جدید ساخته شود.

## توسعه

- `bun install` را اجرا کنید.
- برای اجرای سرور dev محلی، `bun dev` را اجرا کنید (نیازمند Mongo محلی).
- برای تست‌های واحد، `bun test` را اجرا کنید.

## معماری

- **بک‌اند**: Nuxt 3 (Nitro)
- **دیتابیس**: MongoDB (Mongoose)
- **فرانت‌اند**: Nuxt UI (Tailwind)
- **امنیت**: هش‌کردن Argon2، رمزنگاری توکن با AES-256-GCM، و نشست‌های H3
