# Миграция с legacy JS

- **ID:** `architecture/migration-from-js`
- **Источники:** [Modules](https://docs.screeps.com/modules.html), [Scripting Basics](https://docs.screeps.com/scripting-basics.html), [Defense](https://docs.screeps.com/defense.html), [Creeps](https://docs.screeps.com/creeps.html)
- **Этап:** 1

## Mapping

| Legacy | TypeScript |
|---|---|
| `main.js` | `src/main.ts` |
| `_towers.js` | `src/managers/DefenseManager.ts` (поиск башен в комнате) |
| `_units.js` roles | `src/creeps/roles/*Role.ts` |
| `_units.js` spawning | `src/spawning/LegacySpawn.ts` |
| role dispatch | `src/creeps/CreepManager.ts` |

## Правила этапа 1

1. Поведение 1:1 с legacy (лимиты спавна и body без изменений).
2. Башни без hardcoded ID.
3. Корневые legacy `.js` удалены; поведение зафиксировано в `src/` (этап 1).
4. Сборка: `make build` (Podman), не локальный `npm`.
