# Screeps: World — План реализации

Язык: **TypeScript**. Точка входа тика: `export function loop()`. Стек сборки: Rollup + `@types/screeps`, запуск только через **Podman** (`Containerfile`, `make build` / `make push-main`).

**Источник истины по механике игры:** [docs.screeps.com](https://docs.screeps.com/) (Overview, обновлено May 29, 2026). Сообщество (wiki, гайды) — только дополнение; при конфликте побеждает официальная документация и [API Reference](https://docs.screeps.com/api/).

База знаний: `docs/`. Карточка канона документации: `docs/official.md`.

Текущий код — TypeScript в `src/`. Legacy `main.js` / `_units.js` / `_towers.js` удалены после переноса логики этапа 1.

---

## 0. Официальная документация (обязательна при разработке)

Корень: [https://docs.screeps.com/](https://docs.screeps.com/)

### Правило работы

Перед реализацией фичи этапа открываем связанные страницы docs.screeps.com + нужный класс в API. Решения по поведению (тики, Memory, CPU, intents, структуры) фиксируем в `docs/` со ссылкой на официальную документацию. Код не опирается на «как казалось», если страница docs описывает иначе.

### Карта разделов → этапы плана

#### Gameplay

| Раздел | URL | Этапы |
|---|---|---|
| Introduction | https://docs.screeps.com/introduction.html | 0–1 |
| Creeps | https://docs.screeps.com/creeps.html | 1–3 (body, TTL 1500, роли) |
| Control | https://docs.screeps.com/control.html | 2–6 (RCL, GCL, claim) |
| Defense | https://docs.screeps.com/defense.html | 1, 3, 7 (towers, ramparts, safe mode) |
| Respawning | https://docs.screeps.com/respawn.html | ops / аварийные сценарии |
| Start Areas | https://docs.screeps.com/start-areas.html | bootstrap новой колонии |
| Resources | https://docs.screeps.com/resources.html | 3–6 (energy, minerals, store) |
| Market | https://docs.screeps.com/market.html | 6–7 |
| NPC Invaders | https://docs.screeps.com/defense.html#npc-invaders | 3, 5, 7 |
| Power | https://docs.screeps.com/power.html | после этапа 7 |

#### Scripting (ядро архитектуры)

| Раздел | URL | Этапы | Зачем в коде |
|---|---|---|---|
| Scripting Basics | https://docs.screeps.com/scripting-basics.html | 0 | `main` / `loop`, модель скрипта |
| Global Objects | https://docs.screeps.com/global-objects.html | 0–2 | `Game`, `Memory`, `RawMemory` — персистентность |
| Modules | https://docs.screeps.com/modules.html | 0 | разбиение на модули TS → bundle |
| Debugging | https://docs.screeps.com/debugging.html | все | `console`, visual, ошибки тика |
| Game Loop | https://docs.screeps.com/game-loop.html | 0, 2, 8 | тик: state fixed → intents → apply next tick |
| External Commit | https://docs.screeps.com/commit.html | 0 | деплой извне (Rollup push) |
| Simultaneous Actions | https://docs.screeps.com/simultaneous-actions.html | 1+ | несколько intents за тик на одном creep |
| CPU Limit | https://docs.screeps.com/cpu-limit.html | 0, 2, 8 | `Game.cpu`, bucket, лимит по GCL |

#### Other / tooling

| Раздел | URL | Этапы |
|---|---|---|
| Server-Side Architecture | https://docs.screeps.com/architecture.html | 8 (понимание параллелизма комнат) |
| PTR | https://docs.screeps.com/ptr.html | проверка API до продакшена |
| Third Party Tools | https://docs.screeps.com/third-party.html | 0 (деплой, типы) |
| Auth Tokens | https://docs.screeps.com/auth-tokens.html | 0 (push без пароля) |

#### Contributed (официальный индекс статей)

| Статья | URL | Этапы |
|---|---|---|
| Caching Overview | https://docs.screeps.com/contributed/caching-overview.html | 2, 8 |
| Modifying Prototypes | https://docs.screeps.com/contributed/modifying-prototypes.html | по необходимости, осторожно |
| Advanced Grunt Usage | https://docs.screeps.com/contributed/advanced_grunt.html | legacy; у нас Rollup |

#### API (справочник объектов)

База: [https://docs.screeps.com/api/](https://docs.screeps.com/api/)

Обязательные якоря по менеджерам:

- `Game`, `Game.cpu`, `Memory` — Kernel / MemoryManager  
- `Creep`, `StructureSpawn` — CreepManager / SpawnManager  
- `Room`, `StructureController`, `Source` — RoomManager / Logistics  
- `StructureTower` — DefenseManager  
- `StructureContainer`, `StructureStorage`, `StructureLink`, `StructureExtension` — Logistics (этапы 3–4)  
- `StructureTerminal`, `StructureLab` — этапы 6–7  
- `PathFinder`, `RoomPosition` — pathing / CPU  

### Чеклист этапа (docs gate)

Каждый этап закрывается только если:

1. Прочитаны строки из таблицы выше для этого этапа.  
2. В `docs/` есть карточка с выжимкой и URL.  
3. Поведение кода совпадает с docs (особенно: intents применяются на следующий тик; глобалы runtime между тиками не живут; Memory — JSON до 2MB).

---

## 1. Архитектура (акцент)

### 1.1 Принцип

Менеджеры решают **что делать**. Крипы исполняют **узкое задание**. `main` только бутстрапит тик.

```
loop()
 └── Kernel
     ├── MemoryManager (инициализация + миграции схемы)
     ├── CleanupProcess
     ├── ColonyProcess
     │    └── Colony / RoomManager (на каждую owned room)
     │         ├── DefenseManager   (towers, hostiles, safe mode)
     │         ├── SpawnManager     (очередь запросов на спавн)
     │         ├── LogisticsManager (источники → буферы → потребители)
     │         ├── BuildManager     (sites, repair priorities)
     │         └── CreepManager     (role registry → run)
     ├── IntelProcess               (позже)
     └── MarketProcess              (позже)
```

### 1.2 Слои

| Слой | Ответственность | Не делает |
|---|---|---|
| `Kernel` | порядок процессов, приоритеты, CPU-бюджет | логику ролей |
| `RoomManager` | оркестрация комнаты по RCL | `find` внутри каждого крипа заново без кэша |
| `SpawnManager` | очередь `SpawnRequest`, body по бюджету энергии | прямые хардкод-спавны в `loop` |
| `Role` | state machine крипа | глобальную стратегию империи |
| `Task` | атомарное действие (harvest / withdraw / transfer / build / upgrade) | выбор политики комнаты |
| `Memory` | IDs, роли, state, версии схемы | живые `Room`/`Creep` объекты |

### 1.3 Целевая структура `src/`

```
src/
  main.ts
  kernel/
    Kernel.ts
    Process.ts
    ProcessManager.ts
  memory/
    schema.d.ts
    defaults.ts
    migrations.ts
    MemoryManager.ts
  colonies/
    Colony.ts
    ColonyManager.ts
    RoomManager.ts
  managers/
    SpawnManager.ts
    DefenseManager.ts
    LogisticsManager.ts
    BuildManager.ts
  creeps/
    CreepManager.ts
    roles/
      Role.ts
      HarvesterRole.ts
      CarrierRole.ts
      BuilderRole.ts
      UpgraderRole.ts
    tasks/
      harvest.ts
      withdraw.ts
      transfer.ts
      build.ts
      upgrade.ts
  spawning/
    SpawnRequest.ts
    BodyBuilder.ts
  config/
    constants.ts
    rclPolicy.ts
  utils/
    cache.ts
    cpu.ts
    logger.ts
  types/
    roles.ts
```

### 1.4 Контракты

**Process**

```ts
interface Process {
  readonly name: string;
  shouldRun(): boolean;
  run(): void;
}
```

**SpawnRequest** (вместо ручных `units.spawning(...)`)

```ts
interface SpawnRequest {
  role: RoleName;
  priority: number;
  body: BodyPartConstant[];
  memory: CreepMemory;
  roomName: string;
}
```

**CreepMemory (минимум)**

```ts
interface CreepMemory {
  role: RoleName;
  colony: string;
  state?: "harvest" | "deliver" | "build" | "upgrade" | "idle";
  targetId?: Id<_HasId>;
}
```

**Memory schema**

```ts
interface BotMemory {
  schemaVersion: number;
  kernel: { processes: Record<string, { nextRun: number }> };
  colonies: Record<string, ColonyMemory>;
}
```

Миграции: `schemaVersion` + последовательные шаги в `migrations.ts`. Легаси-поля (`role` без `colony`) поднимаются одной миграцией.

### 1.5 Правила CPU и кэша

- Каждый тик: defense, spawn decision, run creeps.
- 2–5 тиков: logistics targets, construction priority.
- 10–50 тиков: layout, intel, market.
- В `Memory` — только то, что дороже пересчитать; пути и списки структур — module-level cache с инвалидацией по событиям.
- Башни: искать через `room.find(FIND_MY_STRUCTURES)` / кэш ID комнаты, без хардкода ID из легаси.

### 1.6 Политика экономики комнаты

Приоритет энергии:

1. Spawn + extensions  
2. Tower при угрозе  
3. Поддержание критичных ролей (miner/carrier)  
4. Upgrader (контроль downgrade / RCL push)  
5. Builder / repair  

Роли ранней игры → после контейнеров:

- `harvester` (static miner у source)  
- `carrier` (hauler)  
- `upgrader`  
- `builder`  

Роли `young*` из легаси — временный bootstrap до стабильной логистики; после RCL2–3 выводятся из политики спавна.

---

## 2. Стратегия реализации (этапы)

### Этап 0 — Инфраструктура TypeScript

Docs: [Scripting Basics](https://docs.screeps.com/scripting-basics.html), [Modules](https://docs.screeps.com/modules.html), [External Commit](https://docs.screeps.com/commit.html), [Auth Tokens](https://docs.screeps.com/auth-tokens.html), [Third Party Tools](https://docs.screeps.com/third-party.html), [Game Loop](https://docs.screeps.com/game-loop.html), [CPU Limit](https://docs.screeps.com/cpu-limit.html).

- Инициализировать TS-проект (starter + Rollup + push).
- Типы `@types/screeps`, `Memory` declarations.
- Сборка **только в Podman** (`Containerfile`, `make build`): `npm install` и `node_modules` внутри образа, на хост не ставятся и не монтируются; наружу копируется только `dist/`.
- `main.ts` → loop с перенесенной логикой этапа 1.
- Критерий готовности: `make build` собирает бандл в контейнере; push через `make push-main` / `make push-sim` с локальным `screeps.json`.

### Этап 1 — Перенос легаси без смены поведения

Docs: [Creeps](https://docs.screeps.com/creeps.html), [Defense](https://docs.screeps.com/defense.html), [Global Objects](https://docs.screeps.com/global-objects.html), [Simultaneous Actions](https://docs.screeps.com/simultaneous-actions.html), API: `Creep`, `StructureTower`, `StructureSpawn`.

- Перенести `_towers.js` → `DefenseManager` (поиск башен в комнате).
- Перенести роли → `roles/*` 1:1 с текущей логикой.
- `CreepManager` + registry по `memory.role`.
- Cleanup мертвой `Memory.creeps`.
- Критерий: колония ведет себя как сейчас на JS.

### Этап 2 — Kernel + RoomManager

Docs: [Game Loop](https://docs.screeps.com/game-loop.html), [Global Objects](https://docs.screeps.com/global-objects.html), [Control](https://docs.screeps.com/control.html), [Caching Overview](https://docs.screeps.com/contributed/caching-overview.html).

- Ввести `Kernel`, `ColonyManager`, `RoomManager`.
- Убрать хардкод spawn-вызовов из `loop`.
- `SpawnManager` с очередью и лимитами по роли из `rclPolicy`.
- Критерий: спавн управляется политикой комнаты, не списком вызовов.

### Этап 3 — Экономика RCL1–3 (база)

Docs: [Resources](https://docs.screeps.com/resources.html), [Control](https://docs.screeps.com/control.html), [Defense](https://docs.screeps.com/defense.html), API: `Source`, `StructureExtension`, `StructureContainer`, `StructureController`. Карточка: `strategies/structure-planning`.

- Static mining: miner → container у source.
- **`StructurePlanner`:** с RCL2 автоматически сайты container у каждого source (ворота RCL; на RCL1 не ставим).
- Carrier: dropped / container → spawn / extensions / tower.
- Tower: attack → heal → repair (с порогом hits).
- Extensions + дороги (`RoadPlanner` + builder).
- Критерий: стабильный поток энергии, container у sources или sites, tower защищает комнату, контроллер не downgrade.

### Этап 4 — RCL4–5 (склад и links)

Docs: [Resources](https://docs.screeps.com/resources.html), [Control](https://docs.screeps.com/control.html), API: `StructureStorage`, `StructureLink`. Карточки: `strategies/structure-planning`, `strategies/logistics-links`.

- **`StructurePlanner`:** RCL4+ сайт storage у spawn; RCL5+ при наличии storage/site — hub-link + source-link (если `CONTROLLER_STRUCTURES` позволяет).
- Storage как буфер.
- `LinkManager`: source → hub → upgrader/storage (demand-driven), после постройки links.
- Body scaling через `BodyBuilder` по `energyCapacityAvailable`.
- Критерий: меньше пробегов carrier, запас энергии в storage, links передают энергию.

### Этап 5 — Remote mining

Docs: [Control](https://docs.screeps.com/control.html) (reserve), [Creeps](https://docs.screeps.com/creeps.html) (CLAIM), [Defense](https://docs.screeps.com/defense.html) / NPC Invaders, API: `StructureController.reservation`.

- Remote source assignment, reservist, roads, profitability check.
- Evacuation при hostiles.
- Критерий: remotes дают net-positive energy без падения home-экономики.

### Этап 6 — Multi-room / empire

Docs: [Control](https://docs.screeps.com/control.html) (GCL), [Market](https://docs.screeps.com/market.html), [Start Areas](https://docs.screeps.com/start-areas.html), API: `StructureTerminal`, `Game.map`.

- Colony roles (energy / industrial / military).
- Terminal balancing, resource requests.
- Claim / bootstrap новой комнаты.
- Критерий: вторая комната поднимается по тому же RoomManager pipeline.

### Этап 7 — Labs, boosts, combat ops

Docs: [Resources](https://docs.screeps.com/resources.html), [Defense](https://docs.screeps.com/defense.html), [Power](https://docs.screeps.com/power.html) (после labs), API: `StructureLab`, combat creep methods.

- Lab modes: reaction / boost / idle.
- Squad processes, intel cache.
- Критерий: boost по запросу операции, не continuous spam.

### Этап 8 — CPU hardening

Docs: [CPU Limit](https://docs.screeps.com/cpu-limit.html), [Game Loop](https://docs.screeps.com/game-loop.html), [Caching Overview](https://docs.screeps.com/contributed/caching-overview.html), [Server-Side Architecture](https://docs.screeps.com/architecture.html), API: `Game.cpu`, `PathFinder`.

- Process intervals, bucket gates, profiler.
- Сокращение лишних `find` / pathing.
- Критерий: стабильный bucket при росте числа комнат.

---

## 3. Ближайший backlog (исполнение)

Порядок работ:

1. [x] Поднять TypeScript scaffold и схему Memory v1 (Podman: `make build`)  
2. [x] Зафиксировать в `docs/official.md` канон разделов docs.screeps.com  
3. [x] Перенести towers без hardcoded IDs (docs: Defense + StructureTower)  
4. [x] Перенести роли harvester / carrier / builder / upgrader (docs: Creeps + Simultaneous Actions)  
5. [ ] SpawnQueue + rclPolicy для одной комнаты (docs: Control + StructureSpawn)  
6. [ ] Kernel + RoomManager wiring (docs: Game Loop + Global Objects)  
7. [x] StructurePlanner: container (RCL2+) / storage (RCL4+) / link (RCL5+), docs `structure-planning` + `logistics-links`  
8. [ ] Static mining roles (miner→container, carrier) после постройки container  
9. [ ] LinkManager transfer после постройки links  
10. [x] Удалить зависимость от корневых `main.js` / `_units.js` / `_towers.js`  

Атомарные задачи и апдейты ведутся в `docs/` (см. [индекс](docs/index.md)). Каждая карточка — один факт/решение; задачи ссылаются на ID карточек.

---

## 4. Связь с базой знаний

| Тема | Карточка |
|---|---|
| Канон docs.screeps.com | `docs/official.md` |
| Тик / CPU | `docs/concepts/game-loop.md` |
| Memory | `docs/concepts/memory.md` |
| RCL прогрессия | `docs/concepts/rcl.md` |
| Экономика | `docs/strategies/energy-economy.md` |
| Оборона | `docs/strategies/defense-towers.md` |
| Ранняя игра | `docs/strategies/early-game.md` |
| Планирование структур | `docs/strategies/structure-planning.md` |
| Remote | `docs/strategies/remote-mining.md` |
| Links | `docs/strategies/logistics-links.md` |
| Архитектура kernel | `docs/architecture/kernel.md` |
| Роли | `docs/architecture/roles.md` |
| Спавн | `docs/architecture/spawn-queue.md` |
| Миграция с JS | `docs/architecture/migration-from-js.md` |
| Деплой на Screeps | `docs/architecture/deploy.md` |
|
