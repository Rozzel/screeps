# Сборка Screeps-бота: зависимости и npm только внутри образа.
# На хост node_modules не ставятся и не монтируются.

FROM docker.io/library/node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM deps AS build
COPY tsconfig.json rollup.config.js .eslintrc.json ./
COPY src ./src
RUN npm run build

# Рабочий образ для build / lint / push (node_modules остаются в контейнере)
FROM build AS runtime
COPY screeps.sample.json ./screeps.sample.json
CMD ["npm", "run", "build"]
