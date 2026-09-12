# Game loop и CPU

- **ID:** `concepts/game-loop`
- **Источники:** [Game Loop](https://docs.screeps.com/game-loop.html), [CPU Limit](https://docs.screeps.com/cpu-limit.html), [API Game.cpu](https://docs.screeps.com/api/#Game.cpu)
- **Этап:** 0–1

## Факты

1. Тик: состояние мира фиксировано на время `loop`; intents применяются в начале следующего тика.
2. Runtime-глобалы между тиками сбрасываются.
3. `Game.cpu.getUsed()` / `limit` / `bucket` — бюджет скрипта; превышение лимита обрывает тик.
4. Точка входа бота: `export function loop()` в `src/main.ts`.

## Решение проекта

Сборка и `npm` только в Podman-образе (`make build`). На хосте нет `node_modules`.
