# Деплой кода на сервер Screeps

- **ID:** `architecture/deploy`
- **Источники:** [External Commit](https://docs.screeps.com/commit.html), [Auth Tokens](https://docs.screeps.com/auth-tokens.html)
- **Этап:** 0–1

## Как исполняется код

Предпочтительный путь (как раньше): **GitHub Integration** на screeps.com.

```text
make build → bot/main.js → git push origin master → GitHub Sync (Folder: bot) → loop()
```

Настройка: [GitHub Integration](https://screeps.com/a/#!/account/github) → Sync from `screeps` → Folder = `bot` → Sync.  
В `bot/` лежит только собранный `main.js`, чтобы Screeps не тянул Makefile/docs как модули.

Дополнительно: API push через token (`make push-main`) и GitHub Actions — см. ниже.
## Настройка

1. Token: https://screeps.com/a/#!/account/auth-mod  
2. Secret репозитория `SCREEPS_TOKEN` = token  
3. Опционально `SCREEPS_BRANCH` = имя ветки в игре (по умолчанию `main`)  
4. В клиенте: Scripts → активная ветка = та же, что в `branch`

## Комната

- Persistent world: Rozzel → Respawn → SELECT YOUR ROOM → клик по пустой комнате (Owner: None) → Place your spawn на plain.
- Текущая колония: **shard2 / E33N16**, spawn **Spawn1**, safe mode активен.
- Новую комнату империи после старта дает claim (этап 6), не кнопка «создать комнату».
