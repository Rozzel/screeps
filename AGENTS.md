# AGENTS.md — правила для ИИ-агентов

Этот репозиторий — бот для [Screeps: World](https://screeps.com/). Код пишется на TypeScript, крутится на сервере игры в `loop()`.

## Перед любой задачей

1. Прочитай план: [`TODO.md`](TODO.md).
2. Открой индекс базы знаний: [`docs/index.md`](docs/index.md).
3. По механике игры сверяйся с [docs.screeps.com](https://docs.screeps.com/) и карточкой [`docs/official.md`](docs/official.md). Сообщество — только дополнение; при конфликте побеждает официальная документация.
4. Для API/библиотек используй Context7 MCP; для актуальных фактов по игре — docs.screeps.com / Perplexity при необходимости.

## Язык и стиль ответов пользователю

- Отвечать на **русском**.
- Буква **ё** не использовать (писать «е»).
- Без лишних альтернатив («или так, или так») — одно конкретное решение.
- Не коммитить и не пушить, пока пользователь явно не попросил.

## Сборка и окружение (обязательно)

- **Локальный `npm install` / `node_modules` на хосте не использовать.**
- Все npm-команды — через **Podman** и `Makefile`:
  - `make build` — бандл в `dist/`
  - `make lint` — Prettier + `tsc` + ESLint (правит `src/` на хосте)
  - `make format` — только автоформат
  - `make push-main` — сборка + upload на ветку Scripts `default`
  - `make push-sim` — upload на ветку `sim`
  - `make vendor-types` — обновить `vendor/@types/screeps` для IDE
- Секрет деплоя: `.env` → `SCREEPS_TOKEN=...` (из `.env.example`). В git не коммитить.
- Успешный push: строка `Uploaded modules [...] → branch "default"`.
- Детали: [`docs/architecture/deploy.md`](docs/architecture/deploy.md), [`docs/architecture/lint.md`](docs/architecture/lint.md).

## Структура кода

| Путь | Назначение |
|---|---|
| `src/main.ts` | Точка входа тика `loop()` |
| `src/creeps/` | Роли и менеджер крипов |
| `src/managers/` | Defense, RoadPlanner, StructurePlanner |
| `src/spawning/` | Спавн по квотам |
| `src/config/` | Политика RCL / квоты |
| `src/memory/` | Memory schema и cleanup |
| `scripts/upload.js` | Upload кода в Screeps API |
| `vendor/@types/screeps` | Типы игры для IDE без локального npm |
| `docs/` | Атомарные карточки решений |
| `docs/reference/main.js` | Читаемый бандл для учебы (не upload) |
| `dist/` | Прод-артефакт (минифицированный, не источник истины) |

Исходники править в `src/`. В игру уходит собранный один модуль `main` (+ source map).

## Правила разработки

1. **Docs gate:** новое поведение по механике → сначала/сразу карточка в `docs/` со ссылкой на docs.screeps.com, правка `TODO.md` и `docs/index.md` при необходимости.
2. Не выдумывать лимиты RCL, costs, API — брать из официальных docs/API.
3. Планировщики структур уважают RCL-ворота (`StructurePlanner`, карточка `strategies/structure-planning`).
4. Ранняя экономика: `strategies/early-game` (bootstrap, roads, scavenger).
5. После существенных правок логики — `make lint`; для выкладки в мир — `make push-main` (если пользователь просит задеплоить).
6. Не предлагать вернуть GitHub Sync / папку `bot/` как основной деплой — принят token + `scripts/upload.js`.

## Чего не делать

- Не класть токены, `.env`, пароли в git или в ответы.
- Не ставить `node_modules` на хост «для удобства».
- Не править игровой канон по памяти без сверки со страницей docs.
- Не раздувать PR/дифф посторонним рефакторингом.
