# Канон официальной документации

- **ID:** `official`
- **Источник истины:** [https://docs.screeps.com/](https://docs.screeps.com/)
- **Обновление docs (Overview):** May 29, 2026
- **Правило:** при конфликте с wiki/гайдами побеждает docs + [API](https://docs.screeps.com/api/)
- **Связь с планом:** `TODO.md` §0, docs gate на каждом этапе

## Входы Overview

- [Tutorial](https://docs.screeps.com/) — интерактивный онбординг
- [API Reference](https://docs.screeps.com/api/) — объекты, методы, прототипы
- [Contributed articles](https://docs.screeps.com/) — статьи игроков в индексе docs
- Discord / GitHub samples — поддержка, не канон механики

## Gameplay

| Тема | URL |
|---|---|
| Introduction | https://docs.screeps.com/introduction.html |
| Creeps | https://docs.screeps.com/creeps.html |
| Control | https://docs.screeps.com/control.html |
| Defense | https://docs.screeps.com/defense.html |
| Respawning | https://docs.screeps.com/respawn.html |
| Start Areas | https://docs.screeps.com/start-areas.html |
| Resources | https://docs.screeps.com/resources.html |
| Market | https://docs.screeps.com/market.html |
| Power | https://docs.screeps.com/power.html |

## Scripting

| Тема | URL |
|---|---|
| Scripting Basics | https://docs.screeps.com/scripting-basics.html |
| Global Objects | https://docs.screeps.com/global-objects.html |
| Modules | https://docs.screeps.com/modules.html |
| Debugging | https://docs.screeps.com/debugging.html |
| Game Loop | https://docs.screeps.com/game-loop.html |
| External Commit | https://docs.screeps.com/commit.html |
| Simultaneous Actions | https://docs.screeps.com/simultaneous-actions.html |
| CPU Limit | https://docs.screeps.com/cpu-limit.html |

## Other

| Тема | URL |
|---|---|
| Server-Side Architecture | https://docs.screeps.com/architecture.html |
| PTR | https://docs.screeps.com/ptr.html |
| Third Party Tools | https://docs.screeps.com/third-party.html |
| Auth Tokens | https://docs.screeps.com/auth-tokens.html |
| Community Servers | https://docs.screeps.com/community-servers.html |

## Contributed (из индекса docs)

| Тема | URL |
|---|---|
| Caching Overview | https://docs.screeps.com/contributed/caching-overview.html |
| Modifying Prototypes | https://docs.screeps.com/contributed/modifying-prototypes.html |
| Advanced Grunt Usage | https://docs.screeps.com/contributed/advanced_grunt.html |

## Инварианты для кода (из docs)

1. Тик: состояние мира фиксировано на время `main`; intents применяются в начале следующего тика ([Game Loop](https://docs.screeps.com/game-loop.html)).
2. Runtime-глобалы между тиками сбрасываются; персистентность — через `Memory` / `RawMemory` ([Global Objects](https://docs.screeps.com/global-objects.html)).
3. CPU ограничен; превышение обрывает скрипт ([CPU Limit](https://docs.screeps.com/cpu-limit.html)).
4. Один creep может выдать несколько совместимых intents за тик ([Simultaneous Actions](https://docs.screeps.com/simultaneous-actions.html)).
5. Сигнатуры методов и константы — только из [API](https://docs.screeps.com/api/).
