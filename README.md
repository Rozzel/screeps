# Screeps bot (Rozzel)

TypeScript-бот для **[Screeps: World](https://screeps.com/)** — MMO, где колонией управляет код на сервере игры.

## Ссылки

- Игра: [screeps.com](https://screeps.com/)
- Документация игры: [docs.screeps.com](https://docs.screeps.com/)
- API: [docs.screeps.com/api](https://docs.screeps.com/api/)
- План работ: [`TODO.md`](TODO.md)
- База знаний проекта: [`docs/index.md`](docs/index.md)
- Правила для ИИ-агентов: [`AGENTS.md`](AGENTS.md)
- Деплой: [`docs/architecture/deploy.md`](docs/architecture/deploy.md)
- Ранняя игра: [`docs/strategies/early-game.md`](docs/strategies/early-game.md)
- Планирование структур: [`docs/strategies/structure-planning.md`](docs/strategies/structure-planning.md)

## Что это за репозиторий

Код колонии пишется в `src/`, собирается в один бандл и загружается в Scripts аккаунта Screeps. Каждый игровой тик сервер вызывает `loop()` из модуля `main`.

Текущая колония (см. deploy-карточку): **shard2 / E33N16**, spawn **Spawn1**.

## Структура

```text
src/           — TypeScript-исходники (источник истины)
  main.ts      — loop(): memory → defense → planners → spawn → creeps
  creeps/      — роли крипов
  managers/    — defense, дороги, container/storage/link planning
  spawning/    — спавн по квотам
  config/      — политика RCL
  memory/      — Memory
scripts/       — upload.js (деплой по auth token)
docs/          — атомарные решения и стратегии
docs/reference/main.js — читаемый бандл для учебы (не в Screeps)
vendor/@types/ — типы Screeps для IDE
dist/          — прод-сборка (минифицированная) для upload
Makefile       — Podman: build / lint / push
```

## Команды (только Podman)

Локальный `npm install` не используется. Нужны Podman и `.env` с `SCREEPS_TOKEN` (шаблон: `.env.example`).

| Команда | Действие |
|---|---|
| `make build` | Собрать бандл в `dist/` |
| `make lint` | Формат + проверка типов и ESLint |
| `make push-main` | Собрать и залить на ветку `default` |
| `make push-sim` | Залить на ветку `sim` |

## Документация проекта

Краткий вход — [`docs/index.md`](docs/index.md). Там же статусы карточек (early-game, structure-planning, deploy, lint, …).

Канон разделов официальной документации: [`docs/official.md`](docs/official.md).
