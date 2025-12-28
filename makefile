include .env
export

COMPOSE = docker compose -f ./docker-compose.yml
KIBANA_DIR = dashboards
KIBANA_FILE = $(KIBANA_DIR)/dashboard.ndjson

PORT := $(if $(KIBANA_PORT),$(KIBANA_PORT),5601)
KIBANA_URL = http://localhost:$(PORT)


all: up

up:
	@echo "Starting containers..."
	@$(COMPOSE) up -d --build

logs:
	@$(COMPOSE) logs -f

down:
	@echo "Stopping containers (Data preserved)..."
	@$(COMPOSE) down

re: down up

init_dir:
	@mkdir -p $(KIBANA_DIR)

get: init_dir
	@echo "💾 Saving Kibana Configs to $(KIBANA_FILE)..."
	@curl -s -f -X POST "$(KIBANA_URL)/api/saved_objects/_export" \
		-u elastic:$(ELASTIC_PASSWORD) \
		-H "kbn-xsrf: true" \
		-H "Content-Type: application/json" \
		-d '{"type":["dashboard","visualization","lens","index-pattern"],"includeReferencesDeep":true}' \
		> $(KIBANA_FILE)
	@echo "✅ Saved successfully!"

set:
	@echo "♻️  Loading Configs from $(KIBANA_FILE) to Kibana..."
	@curl -s -f -X POST "$(KIBANA_URL)/api/saved_objects/_import?overwrite=true" \
		-u elastic:$(ELASTIC_PASSWORD) \
		-H "kbn-xsrf: true" \
		--form file=@$(KIBANA_FILE)
	@echo "✅ Loaded successfully!"

.PHONY: all up down logs re get set init_dir