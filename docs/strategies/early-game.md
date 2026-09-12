# Ранняя игра (RCL1 с нуля)

- **ID:** `strategies/early-game`
- **Источники:** [Creeps](https://docs.screeps.com/creeps.html), [Control](https://docs.screeps.com/control.html), [Resources](https://docs.screeps.com/resources.html)
- **Этап:** 3 / bootstrap

## Цель

Запустить непрерывный цикл энергии в новой комнате без контейнеров и links.

## Политика

1. Роль `bootstrap`: harvest → fill Spawn/Extension → иначе upgrade controller.
2. Квота: 3 × `[WORK, CARRY, MOVE]` (200 energy, влезает в Spawn 300).
3. Если нет крипов вообще — аварийный spawn первого bootstrap.
4. Builder только при наличии construction sites.

## Почему «висит»

Старый youngHarvester при полном Spawn не имел следующего действия.  
Старый harvester искал containers, которых на RCL1 нет.

## Код

- `src/creeps/roles/BootstrapRole.ts`
- `src/config/rclPolicy.ts`
- `src/spawning/ColonySpawn.ts`
