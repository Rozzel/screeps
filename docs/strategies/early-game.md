# Ранняя игра (RCL1 с нуля)

- **ID:** `strategies/early-game`
- **Источники:** [Creeps](https://docs.screeps.com/creeps.html), [Control](https://docs.screeps.com/control.html), [Resources](https://docs.screeps.com/resources.html)
- **Этап:** 3 / bootstrap

## Цель

Запустить непрерывный цикл энергии в новой комнате без контейнеров и links.

## Политика

1. Роль `bootstrap`: loot/pickup (tombstone, dropped) → harvest → fill Spawn/Extension → иначе upgrade controller.
2. Квота: 3 × `[WORK, CARRY, MOVE]` (200 energy, влезает в Spawn 300).
3. Если нет крипов вообще — аварийный spawn первого bootstrap.
4. `RoadPlanner`: `findPath(spawn → source, range: 1)` → `createConstructionSite(STRUCTURE_ROAD)` по шагам пути (до 5 сайтов за тик).
5. `youngBuilder` пока есть любые construction sites (сначала storage/container/link/extension/tower, потом дороги).
6. С RCL2+ `StructurePlanner` ставит container у sources; RCL4+ storage; RCL5+ links (см. `strategies/structure-planning`).

## Смерть крипа

При смерти ресурсы не пропадают сразу: остается **Tombstone** (потом decay), часть может лежать как **dropped**.  
Без подбора энергия сгниет. На bootstrap это закрывает `scavengeEnergy` (`loot` / `pickup`) до harvest.

## Почему «висит»

Старый youngHarvester при полном Spawn не имел следующего действия.  
Старый harvester искал containers, которых на RCL1 нет.

## Код

- `src/creeps/roles/BootstrapRole.ts`
- `src/creeps/tasks/scavengeEnergy.ts`
- `src/managers/RoadPlanner.ts`
- `src/managers/StructurePlanner.ts`
- `src/creeps/roles/YoungBuilderRole.ts`
- `src/config/rclPolicy.ts`
- `src/spawning/ColonySpawn.ts`
