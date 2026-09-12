# Авто-планирование структур (container / storage / link)

- **ID:** `strategies/structure-planning`
- **Источники:** [Control](https://docs.screeps.com/control.html), [StructureContainer](https://docs.screeps.com/api/#StructureContainer), [StructureStorage](https://docs.screeps.com/api/#StructureStorage), [StructureLink](https://docs.screeps.com/api/#StructureLink), [Resources](https://docs.screeps.com/resources.html)
- **Этап:** 3–4

## Принцип

`StructurePlanner` ставит `createConstructionSite` только когда **RCL и `CONTROLLER_STRUCTURES` уже разрешают** структуру. Пока условие не выполнено — планирование этой структуры не начинается.

Дороги (RCL1) остаются в `RoadPlanner`. Здесь — экономика хранения и телепорта энергии.

## Ворота по RCL

| Структура | Когда начинаем планировать | Лимит (официально) | Куда ставим |
|---|---|---|---|
| `STRUCTURE_CONTAINER` | **RCL ≥ 2** | 5 на комнату, любой RCL | 1 клетка у каждого `Source` (static mining); опционально у controller позже |
| `STRUCTURE_STORAGE` | **RCL ≥ 4** | 1 на комнату с RCL4+ | hub у Spawn (свободная walkable клетка рядом) |
| `STRUCTURE_LINK` | **RCL ≥ 5** и есть storage или сайт storage | RCL5: 2, RCL6: 3, RCL7: 4, RCL8: 6 | source-link у source; hub-link у storage |

RCL1 намеренно без container: стройка 5000 energy ломает bootstrap. Сначала дороги + upgrade до RCL2.

## Порядок тика

1. `RoadPlanner`  
2. `StructurePlanner` (containers → storage → links)  
3. Spawn / builders строят любые `FIND_MY_CONSTRUCTION_SITES`

Лимит новых сайтов за тик — как у дорог (не больше нескольких), чтобы не упираться в global cap 100 sites.

## Критерии готовности

- RCL2+: у каждого source есть container или site.  
- RCL4+: storage или site в hub.  
- RCL5+: минимум 2 link (source + hub) или соответствующие sites, если лимит позволяет.

## Код

- `src/managers/StructurePlanner.ts`
- `src/managers/RoadPlanner.ts`
- Карточка links-логики: `strategies/logistics-links`
