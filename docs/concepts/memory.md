# Memory

- **ID:** `concepts/memory`
- **Источники:** [Global Objects](https://docs.screeps.com/global-objects.html), [API Memory](https://docs.screeps.com/api/#Memory)
- **Этап:** 0–1

## Факты

1. `Memory` — JSON между тиками; не хранить живые игровые объекты.
2. Лимит размера и стоимость сериализации CPU.
3. Мертвых крипов нужно чистить из `Memory.creeps`.

## Решение проекта

- Схема v1: `Memory.schemaVersion`, `CreepMemory.role` (+ `building` / `upgrading`).
- Инициализация и миграции: `src/memory/MemoryManager.ts`.
- Cleanup мертвых креепов — один раз за тик в `loop`.
