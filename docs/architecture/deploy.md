# Деплой кода на сервер Screeps

- **ID:** `architecture/deploy`
- **Источники:** [External Commit](https://docs.screeps.com/commit.html), [Auth Tokens](https://docs.screeps.com/auth-tokens.html)
- **Этап:** 0–1

## Как исполняется код

Путь деплоя: **Auth Token** из `.env` → Screeps API через `rollup-plugin-screeps`.

```text
cp .env.example .env   # один раз, SCREEPS_TOKEN=...
make push-main  →  rollup → scripts/upload.js → API (branch default)  →  loop()
```

1. На [Auth Tokens](https://screeps.com/a/#!/account/auth-tokens) создать токен с доступом к commit code.
2. Вписать токен в `.env` (`SCREEPS_TOKEN=...`). Файл в `.gitignore`.
3. `make push-main` — сборка в Podman и upload на ветку Scripts `default` (скрипт ждет ответа API).
4. `make push-sim` — то же на ветку `sim`.
5. `make build` — бандлы: `dist/main.js` (прод, сжатый) и `docs/reference/main.js` (читаемый, с комментариями, не для upload).

Успешный push заканчивается строкой `Uploaded modules [...] → branch "default"`.  
В начале `dist/main.js` — комментарий версии (`v*`, `built:`, `git:`); дальше код **минифицирован в одну строку**, без прочих комментариев (Terser). Screeps принимает такой JS как обычный модуль.

Читаемая копия для учебы: [`docs/reference/main.js`](../reference/main.js) — см. [`architecture/readable-bundle`](../reference/README.md).

Папка `bot/` и GitHub Sync для деплоя не используются.

## Комната

- Persistent world: Rozzel → Respawn → SELECT YOUR ROOM → клик по пустой комнате (Owner: None) → Place your spawn на plain.
- Текущая колония: **shard2 / E33N16**, spawn **Spawn1**.
- Новую комнату империи после старта дает claim (этап 6), не кнопка «создать комнату».
