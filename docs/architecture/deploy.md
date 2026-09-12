# Деплой кода на сервер Screeps

- **ID:** `architecture/deploy`
- **Источники:** [External Commit](https://docs.screeps.com/commit.html)
- **Этап:** 0–1

## Как исполняется код

Путь деплоя: **GitHub Integration** на screeps.com (без token / без Actions).

```text
make build → bot/main.js → git push origin master → GitHub Sync (Folder: bot) → loop()
```

Настройка: [GitHub Integration](https://screeps.com/a/#!/account/github) → Sync from `screeps` → Folder = `bot` → Sync.  
В `bot/` лежит только собранный `main.js`, чтобы Screeps не тянул Makefile/docs как модули.

## Комната

- Persistent world: Rozzel → Respawn → SELECT YOUR ROOM → клик по пустой комнате (Owner: None) → Place your spawn на plain.
- Текущая колония: **shard2 / E33N16**, spawn **Spawn1**, safe mode активен.
- Новую комнату империи после старта дает claim (этап 6), не кнопка «создать комнату».
