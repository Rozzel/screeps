IMAGE ?= screeps-bot
CONTAINER ?= screeps-extract

.PHONY: image build format lint vendor-types push-main push-sim clean-container

# Собрать образ (npm install + dist внутри контейнера)
image:
	podman build -t $(IMAGE) -f Containerfile .

# Обновить vendor/@types/screeps из образа (для IDE без локального node_modules)
vendor-types: image
	rm -rf vendor/@types/screeps
	mkdir -p vendor/@types
	podman run --rm $(IMAGE) tar -C /app/node_modules/@types -cf - screeps | tar -C vendor/@types -xf -

# Собрать бандл в образе, скопировать только dist/ (без upload)
build: image
	-podman rm -f $(CONTAINER) >/dev/null 2>&1
	podman create --name $(CONTAINER) $(IMAGE)
	rm -rf dist
	podman cp $(CONTAINER):/app/dist ./dist
	podman rm -f $(CONTAINER)

# Prettier + ESLint --fix пишут в смонтированные исходники на хосте
format: image
	podman run --rm \
		-v "$(CURDIR)/src:/app/src:Z" \
		-v "$(CURDIR)/scripts:/app/scripts:Z" \
		-v "$(CURDIR)/.eslintrc.json:/app/.eslintrc.json:Z" \
		-v "$(CURDIR)/.prettierrc.json:/app/.prettierrc.json:ro,Z" \
		-v "$(CURDIR)/.prettierignore:/app/.prettierignore:ro,Z" \
		-v "$(CURDIR)/tsconfig.json:/app/tsconfig.json:Z" \
		-v "$(CURDIR)/package.json:/app/package.json:Z" \
		$(IMAGE) npm run format

# Форматирование + typecheck + ESLint (исходники с хоста)
lint: format
	podman run --rm \
		-v "$(CURDIR)/src:/app/src:ro,Z" \
		-v "$(CURDIR)/scripts:/app/scripts:ro,Z" \
		-v "$(CURDIR)/vendor:/app/vendor:ro,Z" \
		-v "$(CURDIR)/.eslintrc.json:/app/.eslintrc.json:ro,Z" \
		-v "$(CURDIR)/.prettierrc.json:/app/.prettierrc.json:ro,Z" \
		-v "$(CURDIR)/.prettierignore:/app/.prettierignore:ro,Z" \
		-v "$(CURDIR)/tsconfig.json:/app/tsconfig.json:ro,Z" \
		-v "$(CURDIR)/package.json:/app/package.json:ro,Z" \
		$(IMAGE) npm run check

# Нужен локальный .env с SCREEPS_TOKEN (из .env.example), в git не коммитится
push-main: image
	@test -f .env || (echo "Скопируй .env.example → .env и впиши SCREEPS_TOKEN"; exit 1)
	podman run --rm --env-file "$(CURDIR)/.env" \
		$(IMAGE) npm run push-main

push-sim: image
	@test -f .env || (echo "Скопируй .env.example → .env и впиши SCREEPS_TOKEN"; exit 1)
	podman run --rm --env-file "$(CURDIR)/.env" \
		$(IMAGE) npm run push-sim

clean-container:
	-podman rm -f $(CONTAINER) >/dev/null 2>&1
	-podman rmi $(IMAGE) >/dev/null 2>&1
