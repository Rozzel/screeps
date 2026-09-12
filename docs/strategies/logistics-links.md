# Links: дистанционная передача энергии

- **ID:** `strategies/logistics-links`
- **Источники:** [StructureLink](https://docs.screeps.com/api/#StructureLink), [Control](https://docs.screeps.com/control.html), [Resources](https://docs.screeps.com/resources.html)
- **Этап:** 4

## Условие старта планирования

Планируем links только если **все** верно:

1. `controller.level >= 5`  
2. В комнате есть `STRUCTURE_STORAGE` или construction site storage (hub)  
3. Текущее число links + sites link `< CONTROLLER_STRUCTURES[STRUCTURE_LINK][rcl]`

Иначе `StructurePlanner` links не трогает.

## Топология (одна комната)

```text
Source ──link──► Hub link (у Storage) ──link──► (позже) Controller link
```

На RCL5 доступно **2** link → только **source → hub**.  
Дополнительные links (controller / второй source) — с RCL6+, по свободному слоту.

## Эксплуатация (после постройки)

- Cooldown: 1 тик × линейная дистанция до цели.  
- Потеря: 3% энергии.  
- Передача: `link.transferEnergy(targetLink)` по demand (hub не полный / upgrader нуждается).

Отдельный `LinkManager` — после того как sites построены (этап 4 backlog).

## Связь

Планирование позиций: `strategies/structure-planning`.
