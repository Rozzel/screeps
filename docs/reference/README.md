# Читаемый бандл (для учебы)

- **ID:** `architecture/readable-bundle`
- **Этап:** 0–1

## Зачем

`docs/reference/main.js` — **несжатая** сборка всего бота с сохраненными комментариями из `src/`.  
Смотреть структуру `loop`, ролей и планировщиков без минификации.

## Важно

- В Screeps **не загружать**. Upload берет только `dist/main.js`.
- Файл генерируется при `make build` / `make push-main` (Rollup educational target).
- Править логику в `src/`, не в этом файле.

## Связь

- Прод-бандл: `dist/main.js` (Terser, одна строка).
- Деплой: `architecture/deploy`.
