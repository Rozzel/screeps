IMAGE ?= screeps-bot
CONTAINER ?= screeps-extract

.PHONY: image build lint push-main push-sim clean-container

# Собрать образ (npm install + dist внутри контейнера)
image:
	podman build -t $(IMAGE) -f Containerfile .

# Собрать бандл в образе, скопировать dist/ и корневой main.js для GitHub Sync
build: image
	-podman rm -f $(CONTAINER) >/dev/null 2>&1
	podman create --name $(CONTAINER) $(IMAGE)
	rm -rf dist
	podman cp $(CONTAINER):/app/dist ./dist
	podman rm -f $(CONTAINER)
	cp dist/main.js ./main.js
	mkdir -p bot
	cp dist/main.js ./bot/main.js

lint: image
	podman run --rm $(IMAGE) npm run lint

# Нужен локальный screeps.json (из screeps.sample.json), в git не коммитится
push-main: image
	podman run --rm \
		-v "$(CURDIR)/screeps.json:/app/screeps.json:ro,Z" \
		$(IMAGE) npm run push-main

push-sim: image
	podman run --rm \
		-v "$(CURDIR)/screeps.json:/app/screeps.json:ro,Z" \
		$(IMAGE) npm run push-sim

clean-container:
	-podman rm -f $(CONTAINER) >/dev/null 2>&1
	-podman rmi $(IMAGE) >/dev/null 2>&1
