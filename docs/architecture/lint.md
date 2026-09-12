# Линт, типы и форматирование

- **ID:** `architecture/lint`
- **Источники:** [typescript-eslint](https://typescript-eslint.io/), [Prettier](https://prettier.io/), `tsc --noEmit`
- **Этап:** 0–1

## Запуск

```text
make format  →  Prettier --write + ESLint --fix  (правит файлы на хосте)
make lint    →  make format  →  prettier --check + tsc + eslint
```

Оба запускаются в Podman; `src/` и конфиги монтируются с хоста, поэтому выравнивание попадает в рабочую копию.

## Что проверяется

1. **Prettier** — отступы, переносы, кавычки, единообразный стиль  
2. **tsc --noEmit** — ошибки типов  
3. **ESLint** (type-aware) — логика/стиль TS; `--max-warnings 0`

Конфиг: `.prettierrc.json`, `.eslintrc.json`, `tsconfig.json`. Локальный `npm install` не нужен.
