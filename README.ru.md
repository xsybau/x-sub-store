# Выбор Языка Документации: [English](README.md) | [فارسی](README.fa.md) | [Русский](README.ru.md) | [中文](README.zh.md)

# X-SUB-Store

X-SUB-Store — безопасная система агрегирования и управления подписками V2Ray с подходом Docker-first.

## Возможности

- **Централизованный хаб**: объединяет несколько подписок (Hiddify, Xray и др.) в одну.
- **Админ-панель**: управление пользователями, тегами, upstream-источниками и статическими нодами.
- **Доставка по тегам**: несколько тегов на пользователя, теги по умолчанию для новых пользователей, привязка источников к тегам.
- **Операционный UX**: быстрое копирование пользовательского URL подписки и live-проверка upstream-источников.
- **Безопасность**: секретный токен для каждого пользователя, без публичной регистрации, шифрованное хранение токенов.
- **Производительность**: кэширование, параллельная загрузка, дедупликация.
- **Docker-first**: простой деплой с Nginx и автоматизацией SSL.

## Интернационализация UI

- Поддерживаемые локали UI: `en` (по умолчанию), `fa`, `ru`, `zh`
- Маршруты без языковых префиксов (`/admin/...` без изменений)
- Переключатель языка доступен:
  - в сайдбаре админ-лейаута
  - на странице входа администратора
- Для персидской локали (`fa`) включается `RTL` и зеркальное поведение оболочки админки.
- На этом этапе локализован только UI; сообщения API/бэкенда остаются исходными.

## Структура Nuxt 4 (App Directory)

- Клиентские директории Nuxt находятся в `app/`:
  - `app/pages`, `app/layouts`, `app/components`, `app/composables`, `app/middleware`, `app/plugins`, `app/assets`
- Доменные и серверные границы остаются в корне репозитория:
  - `modules/`, `i18n/`, `server/`, `scripts/`, `tests/`, `public/`
- Совместимые корневые импорты сохранены:
  - `~/modules/*`, `~/i18n/*`, `~/server/*`

## Быстрый старт (Dev)

1. Клонируйте репозиторий.
2. Скопируйте и отредактируйте `.env`:
   ```bash
   cp .env.example .env
   ```
3. Поднимите dev-стек:
   ```bash
   docker compose -f compose.dev.yml up -d
   ```
4. Запустите Nuxt dev вручную внутри контейнера сервиса `app`:
   ```bash
   docker compose -f compose.dev.yml exec app bun run dev --host 0.0.0.0 --port 3000
   ```
5. Создайте администратора (в другом терминале):
   ```bash
   docker compose -f compose.dev.yml exec app bun run scripts/create-admin.ts --email admin@example.com --password secret
   ```
6. Доступ:
   - `https://localhost/admin`
   - `http://localhost:3000/admin`
   - `http://localhost/subs/<token>`

## Локальный HTTPS (как в деплое)

```bash
docker compose -f compose.dev.yml up -d
```

Запускаются сервисы `traefik`, `app`, `mongo`.
`DEV_DOMAIN` по умолчанию: `localhost`.

Примечания:
- Traefik автоматически выдает self-signed dev-сертификат для `https://localhost`; клиенты могут показывать `UntrustedRoot`.
- Для локального импорта подписок используйте `http://localhost/subs/<token>` или задайте `NUXT_PUBLIC_SUBSCRIPTION_BASE_URL=http://localhost`.

## Продакшен-деплой

1. Укажите `DOMAIN` и `EMAIL` в `.env`.
2. Инициализируйте SSL-сертификаты:
   ```bash
   chmod +x ops/ssl/init.sh
   ./ops/ssl/init.sh
   ```
3. Соберите и запустите продакшен-стек:
   ```bash
   docker compose -f compose.yml up -d --build
   ```
4. Для обычных перезапусков без пересборки:
   ```bash
   docker compose -f compose.yml up -d
   ```
5. Данные MongoDB сохраняются в именованном Docker-томе.

## Управление

### Пользователи

- Войдите в админ-панель.
- Создайте пользователя: каждому выдается уникальный URL подписки.
- Назначайте пользователям несколько тегов.
- Используйте действие "Copy Subscription URL" в списке пользователей.
- Выдавайте URL пользователю для клиентов V2Ray (v2rayNG, V2Box и т.д.).
- По умолчанию выдаются raw URL-строки (`vless://`, `vmess://`, ...).
- При необходимости добавьте `?format=base64`.

### Upstream-источники

- **Global**: применяется ко всем пользователям.
- **User**: применяется к конкретному пользователю.
- **Tag**: применяется к пользователям с указанным тегом.
- Поддерживаются raw-текст списки и base64-ссылки.
- "Test Fetch" обновляет `Last Status` и `Last Check`.

### Теги

- Создание, редактирование и удаление тегов.
- Назначение нескольких тегов по умолчанию для новых пользователей.
- Управление tag-scoped upstream и static node в деталях тега.
- Массовое применение тега к выбранным или всем пользователям.
- Массовые действия по пользователям тега:
  - деактивация аккаунтов
  - ротация токенов
  - удаление пользователей

### Ротация токена

- В деталях пользователя нажмите "Rotate Token", чтобы сразу инвалидировать старый URL и выдать новый.

## Разработка

Рекомендуемый режим: выполнять команды в контейнере сервиса `app`.

- lint + typecheck:
  ```bash
  docker compose -f compose.dev.yml exec app bun run lint
  ```
- полный lint без кэша:
  ```bash
  docker compose -f compose.dev.yml exec app bun run lint:full
  ```
- build:
  ```bash
  docker compose -f compose.dev.yml exec app bun run build
  ```
- тесты:
  ```bash
  docker compose -f compose.dev.yml exec app bun test
  ```

## Архитектура

- **Бэкенд**: Nuxt 4 (Nitro)
- **База данных**: MongoDB (Mongoose)
- **Фронтенд**: Nuxt UI (Tailwind)
- **Runtime**: Bun
- **Безопасность**: Argon2, AES-256-GCM для токенов, H3-сессии
