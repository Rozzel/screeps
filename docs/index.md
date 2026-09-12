# База знаний Screeps (атомарная)

Каждая карточка — один факт или решение. Задачи в `TODO.md` ссылаются на ID карточек.

## Индекс

| ID | Файл | Статус |
|---|---|---|
| `official` | [official.md](official.md) | готово |
| `concepts/game-loop` | [concepts/game-loop.md](concepts/game-loop.md) | готово |
| `concepts/memory` | [concepts/memory.md](concepts/memory.md) | готово |
| `concepts/rcl` | concepts/rcl.md | planned |
| `strategies/energy-economy` | strategies/energy-economy.md | planned |
| `strategies/defense-towers` | strategies/defense-towers.md | planned |
| `strategies/early-game` | [strategies/early-game.md](strategies/early-game.md) | готово |
| `strategies/remote-mining` | strategies/remote-mining.md | planned |
| `strategies/logistics-links` | strategies/logistics-links.md | planned |
| `architecture/kernel` | architecture/kernel.md | planned |
| `architecture/roles` | architecture/roles.md | planned |
| `architecture/spawn-queue` | architecture/spawn-queue.md | planned |
| `architecture/migration-from-js` | [architecture/migration-from-js.md](architecture/migration-from-js.md) | готово |
| `architecture/deploy` | [architecture/deploy.md](architecture/deploy.md) | готово |

## Сборка

Только через Podman: `make build`. `node_modules` живут в образе, на хост не пробрасываются.

## Правило обновления

1. Новое решение по механике → карточка + ссылка на https://docs.screeps.com/  
2. Изменение плана → правка `TODO.md` + ID карточки в backlog  
3. Канон docs не переписываем из памяти: сверяем страницу docs/API  
